import { chooseMethod } from './method-chooser'
import { isPromise } from '../utils'

export class BroadcastChannel {
  constructor (name, options = {}) {
    this.name = name
    this.options = options
    this.method = chooseMethod(this.options)
    this.closed = false

    // isListening
    this._iL = false

    /**
     * _onMessageListener
     * setting onmessage twice,
     * will overwrite the first listener
     */
    this._onML = null

    /**
     * _addEventListeners
     */
    this._addEL = {
      message: [],
      internal: []
    }

    /**
     * Un send message promises
     * where the sending is still in progress
     * @type {Set<Promise>}
     */
    this._uMP = new Set()

    /**
     * _beforeClose
     * array of promises that will be awaited
     * before the channel is closed
     */
    this._befC = []

    /**
     * _preparePromise
     */
    this._prepP = null
    _prepareChannel(this)
  }

  postMessage (msg) {
    if (this.closed) {
      throw new Error(
        'BroadcastChannel.postMessage(): ' +
        'Cannot post message after channel has closed'
      )
    }
    return _post(this, 'message', msg)
  }

  postInternal (msg) {
    return _post(this, 'internal', msg)
  }

  set onmessage (fn) {
    const time = this.method.microSeconds()
    const listenObj = {
      time,
      fn
    }
    _removeListenerObject(this, 'message', this._onML)
    if (fn && typeof fn === 'function') {
      this._onML = listenObj
      _addListenerObject(this, 'message', listenObj)
    } else {
      this._onML = null
    }
  }

  get onmessage () {
    return this._onML
  }

  addEventListener (type, fn) {
    const time = this.method.microSeconds()
    const listenObj = {
      time,
      fn
    }
    _addListenerObject(this, type, listenObj)
  }

  removeEventListener (type, fn) {
    const obj = this._addEL[type].find(obj => obj.fn === fn)
    _removeListenerObject(this, type, obj)
  }

  close () {
    if (this.closed) {
      return
    }
    this.closed = true
    const awaitPrepare = this._prepP ? this._prepP : Promise.resolve()

    this._onML = null
    this._addEL.message = []

    return awaitPrepare
      // wait until all current sending are processed
      .then(() => Promise.all(Array.from(this._uMP)))
      // run before-close hooks
      .then(() => Promise.all(this._befC.map(fn => fn())))
      // close the channel
      .then(() => this.method.close(this._state))
  }

  type () {
    return this.method.type
  }

  isClosed () {
    return this.closed
  }
}

/**
 * Post a message over the channel
 * @returns {Promise} that resolved when the message sending is done
 */
function _post (broadcastChannel, type, msg) {
  const time = broadcastChannel.method.microSeconds()
  const msgObj = {
    time,
    type,
    data: msg
  }

  const awaitPrepare = broadcastChannel._prepP ? broadcastChannel._prepP : Promise.resolve()
  return awaitPrepare.then(() => {
    const sendPromise = broadcastChannel.method.postMessage(
      broadcastChannel._state,
      msgObj
    )

    // add/remove to unsend messages list
    broadcastChannel._uMP.add(sendPromise)
    sendPromise
      .catch()
      .then(() => broadcastChannel._uMP.delete(sendPromise))

    return sendPromise
  })
}

function _prepareChannel (channel) {
  const maybePromise = channel.method.create(channel.name, channel.options)
  if (isPromise(maybePromise)) {
    channel._prepP = maybePromise
    maybePromise.then(s => {
      channel._state = s
    })
  } else {
    channel._state = maybePromise
  }
}

function _hasMessageListeners (channel) {
  if (channel._addEL.message.length > 0) return true
  if (channel._addEL.internal.length > 0) return true
  return false
}

function _addListenerObject (channel, type, obj) {
  channel._addEL[type].push(obj)
  _startListening(channel)
}

function _removeListenerObject (channel, type, obj) {
  channel._addEL[type] = channel._addEL[type].filter(o => o !== obj)
  _stopListening(channel)
}

function _startListening (channel) {
  if (!channel._iL && _hasMessageListeners(channel)) {
    // someone is listening, start subscribing

    const listenerFn = msgObj => {
      channel._addEL[msgObj.type].forEach(obj => {
        if (msgObj.time >= obj.time) {
          obj.fn(msgObj.data)
        }
      })
    }

    const time = channel.method.microSeconds()
    if (channel._prepP) {
      channel._prepP.then(() => {
        channel._iL = true
        channel.method.onMessage(
          channel._state,
          listenerFn,
          time
        )
      })
    } else {
      channel._iL = true
      channel.method.onMessage(
        channel._state,
        listenerFn,
        time
      )
    }
  }
}

function _stopListening (channel) {
  if (channel._iL && !_hasMessageListeners(channel)) {
    // no one is listening, stop subscribing
    channel._iL = false
    const time = channel.method.microSeconds()
    channel.method.onMessage(
      channel._state,
      null,
      time
    )
  }
}
