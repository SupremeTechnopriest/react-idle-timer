import { chooseMethod } from './methodChooser'
import { isPromise } from '../utils'

export class MessageChannel {
  constructor (name, options = {}) {
    this.name = name
    this.options = options
    this.method = chooseMethod(this.options)
    this.closed = false

    // isListening
    this._isListening = false

    /**
     * _onMessageListener
     * setting onmessage twice,
     * will overwrite the first listener
     */
    this._onMessageListener = null

    /**
     * _addEventListeners
     */
    this._addEventListeners = {
      message: [],
      internal: []
    }

    /**
     * Un send message promises
     * where the sending is still in progress
     * @type {Set<Promise>}
     */
    this._unSendMessagePromises = new Set()

    /**
     * _beforeClose
     * array of promises that will be awaited
     * before the channel is closed
     */
    this._beforeClose = []

    /**
     * _preparePromise
     */
    this._preparePromises = null
    _prepareChannel(this)
  }

  postMessage (msg) {
    if (this.closed) {
      throw new Error(
        '❌ Cannot post message after channel has closed'
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
    _removeListenerObject(this, 'message', this._onMessageListener)
    if (fn && typeof fn === 'function') {
      this._onMessageListener = listenObj
      _addListenerObject(this, 'message', listenObj)
    } else {
      /* istanbul ignore next */
      this._onMessageListener = null
    }
  }

  /* istanbul ignore next */
  get onmessage () {
    return this._onMessageListener
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
    const obj = this._addEventListeners[type].find(obj => obj.fn === fn)
    _removeListenerObject(this, type, obj)
  }

  close () {
    if (this.closed) {
      return
    }
    this.closed = true
    const awaitPrepare = this._preparePromises ? this._preparePromises : Promise.resolve()

    this._onMessageListener = null
    this._addEventListeners.message = []

    return awaitPrepare
      // Wait until all current sending are processed
      .then(() => Promise.all(Array.from(this._unSendMessagePromises)))
      // Run before-close hooks
      .then(() => Promise.all(this._beforeClose.map(fn => fn())))
      // Close the channel
      .then(() => this.method.close(this._state))
  }

  get type () {
    return this.method.type
  }

  isClosed () {
    return this.closed
  }
}

function _post (messageChannel, type, msg) {
  const time = messageChannel.method.microSeconds()
  const msgObj = {
    time,
    type,
    data: msg
  }

  const awaitPrepare = messageChannel._preparePromises ? messageChannel._preparePromises : Promise.resolve()
  return awaitPrepare.then(() => {
    const sendPromise = messageChannel.method.postMessage(
      messageChannel._state,
      msgObj
    )

    // add/remove to un-send messages list
    messageChannel._unSendMessagePromises.add(sendPromise)
    sendPromise
      .catch()
      .then(() => messageChannel._unSendMessagePromises.delete(sendPromise))

    return sendPromise
  })
}

function _prepareChannel (channel) {
  const maybePromise = channel.method.create(channel.name, channel.options)
  /* istanbul ignore next */
  if (isPromise(maybePromise)) {
    channel._preparePromises = maybePromise
    maybePromise.then(s => {
      channel._state = s
    })
  } else {
    channel._state = maybePromise
  }
}

function _hasMessageListeners (channel) {
  if (channel._addEventListeners.message.length > 0) return true
  if (channel._addEventListeners.internal.length > 0) return true
  return false
}

function _addListenerObject (channel, type, obj) {
  channel._addEventListeners[type].push(obj)
  _startListening(channel)
}

function _removeListenerObject (channel, type, obj) {
  channel._addEventListeners[type] = channel._addEventListeners[type].filter(o => o !== obj)
  _stopListening(channel)
}

function _startListening (channel) {
  if (!channel._isListening && _hasMessageListeners(channel)) {
    // someone is listening, start subscribing

    const listenerFn = msgObj => {
      channel._addEventListeners[msgObj.type].forEach(obj => {
        if (msgObj.time >= obj.time) {
          obj.fn(msgObj.data)
        }
      })
    }

    const time = channel.method.microSeconds()
    if (channel._preparePromises) {
      /* istanbul ignore next */
      channel._preparePromises.then(() => {
        channel._isListening = true
        channel.method.onMessage(
          channel._state,
          listenerFn,
          time
        )
      })
    } else {
      channel._isListening = true
      channel.method.onMessage(
        channel._state,
        listenerFn,
        time
      )
    }
  }
}

function _stopListening (channel) {
  if (channel._isListening && !_hasMessageListeners(channel)) {
    // no one is listening, stop subscribing
    channel._isListening = false
    const time = channel.method.microSeconds()
    channel.method.onMessage(
      channel._state,
      null,
      time
    )
  }
}
