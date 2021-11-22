import timer from '../timer'
import { IS_BROWSER, sleep, randomToken } from '../utils'

class LeaderElection {
  constructor (channel, options) {
    this._channel = channel
    this._options = options

    this.isLeader = false
    this.isDead = false
    this.token = randomToken()

    this._isApplying = false
    this._reApply = false

    // things to clean up
    this._unloadFns = []
    this._listeners = []
    this._intervals = []
    this._duplicateListeners = () => { }
    this._duplicateCalled = false
    this._onBeforeDie = async () => {}

    const unloadFn = async () => this.die()

    if (IS_BROWSER) {
      window.addEventListener('beforeUnload', unloadFn)
      window.addEventListener('unload', unloadFn)

      this._unloadFns.push(['beforeUnload', unloadFn])
      this._unloadFns.push(['unload', unloadFn])
    }
  }

  applyOnce () {
    if (this.isLeader) return Promise.resolve(false)
    if (this.isDead) return Promise.resolve(false)

    // do nothing if already running
    if (this._isApplying) {
      this._reApply = true
      return Promise.resolve(false)
    }
    this._isApplying = true

    let stopCriteria = false
    const received = []

    const handleMessage = (msg) => {
      if (msg.context === 'leader' && msg.token !== this.token) {
        received.push(msg)

        if (msg.action === 'apply') {
          // Other is applying
          if (msg.token > this.token) {
            // Other has higher token, stop applying
            stopCriteria = true
          }
        }

        if (msg.action === 'tell') {
          // Other is already leader
          stopCriteria = true
        }
      }
    }
    this._channel.addEventListener('internal', handleMessage)

    return _sendMessage(this, 'apply') // send out that this one is applying
      .then(() => sleep(this._options.responseTime)) // let others time to respond
      .then(() => {
        if (stopCriteria) return Promise.reject(new Error())
        else return _sendMessage(this, 'apply')
      })
      .then(() => sleep(this._options.responseTime)) // let others time to respond
      .then(() => {
        if (stopCriteria) return Promise.reject(new Error())
        else return _sendMessage(this)
      })
      .then(() => beLeader(this)) // no one disagreed -> this one is now leader
      .then(() => true)
      .catch(() => false) // apply not successful
      .then(success => {
        this._channel.removeEventListener('internal', handleMessage)
        this._isApplying = false
        if (!success && this._reApply) {
          this._reApply = false
          return this.applyOnce()
        } else return success
      })
  }

  awaitLeadership () {
    if (
      !this._awaitLeadershipPromise
    ) {
      this._awaitLeadershipPromise = _awaitLeadershipOnce(this)
    }
    return this._awaitLeadershipPromise
  }

  set onDuplicate (fn) {
    this._duplicateListeners = fn
  }

  /* istanbul ignore next */
  get onDuplicate () {
    return this._duplicateListeners
  }

  set onBeforeDie (fn) {
    this._onBeforeDie = fn
  }

  /* istanbul ignore next */
  get onBeforeDie () {
    return this._onBeforeDie
  }

  async die () {
    if (this.isDead) return
    this.isDead = true

    await this.onBeforeDie()
    this._listeners.forEach(listener => this._channel.removeEventListener('internal', listener))
    this._intervals.forEach(interval => timer.clearInterval(interval))
    this._unloadFns.forEach(uFn => {
      if (IS_BROWSER) {
        window.removeEventListener(uFn[0], uFn[1])
      }
    })
    return _sendMessage(this, 'death')
  }
}

function _awaitLeadershipOnce (leaderElector) {
  if (leaderElector.isLeader) return Promise.resolve()

  return new Promise(resolve => {
    let resolved = false

    function finish () {
      /* istanbul ignore next */
      if (resolved) {
        return
      }
      resolved = true
      timer.clearInterval(interval)
      leaderElector._channel.removeEventListener('internal', whenDeathListener)
      resolve(true)
    }

    // try once now
    leaderElector.applyOnce().then(() => {
      if (leaderElector.isLeader) {
        finish()
      }
    })

    // try on fallbackInterval
    const interval = timer.setInterval(() => {
      /* istanbul ignore next */
      leaderElector.applyOnce().then(() => {
        if (leaderElector.isLeader) {
          finish()
        }
      })
    }, leaderElector._options.fallbackInterval)
    leaderElector._intervals.push(interval)

    // try when other leader dies
    const whenDeathListener = msg => {
      if (msg.context === 'leader' && msg.action === 'death') {
        leaderElector.applyOnce().then(() => {
          if (leaderElector.isLeader) finish()
        })
      }
    }
    leaderElector._channel.addEventListener('internal', whenDeathListener)
    leaderElector._listeners.push(whenDeathListener)
  })
}

/**
 * Sends and internal message over the broadcast-channel
 */
function _sendMessage (leaderElector, action) {
  const msgJson = {
    context: 'leader',
    action,
    token: leaderElector.token
  }
  return leaderElector._channel.postInternal(msgJson)
}

export function beLeader (leaderElector) {
  leaderElector.isLeader = true

  const isLeaderListener = msg => {
    if (msg.context === 'leader' && msg.action === 'apply') {
      _sendMessage(leaderElector, 'tell')
    }

    if (msg.context === 'leader' && msg.action === 'tell' && !leaderElector._duplicateCalled) {
      /**
       * Another instance is also leader!
       * This can happen on rare events
       * like when the CPU is at 100% for long time
       * or the tabs are open very long and the browser throttles them.
       */
      leaderElector._duplicateCalled = true
      leaderElector._duplicateListeners() // message the lib user so the app can handle the problem
      _sendMessage(leaderElector, 'tell') // ensure other leader also knows the problem
    }
  }
  leaderElector._channel.addEventListener('internal', isLeaderListener)
  leaderElector._listeners.push(isLeaderListener)
  return _sendMessage(leaderElector, 'tell')
}

export function createLeaderElection (channel, options) {
  if (channel._leaderElector) {
    throw new Error('❌ MessageChannel already has a leader-elector')
  }

  const elector = new LeaderElection(channel, options)
  channel._beforeClose.push(async () => elector.die())

  channel._leaderElector = elector
  return elector
}
