import { sleep, randomToken, IS_BROWSER } from '../utils'

class LeaderElection {
  constructor (channel, options) {
    this._channel = channel
    this._options = options

    this.isLeader = false
    this.isDead = false
    this.token = randomToken()

    this._isApl = false // _isApplying
    this._reApply = false

    // things to clean up
    this._unl = [] // _unloads
    this._lstns = [] // _listeners
    this._invs = [] // _intervals
    this._dpL = () => { } // onduplicate listener
    this._dpLC = false // true when onduplicate called
  }

  applyOnce () {
    if (this.isLeader) return Promise.resolve(false)
    if (this.isDead) return Promise.resolve(false)

    // do nothing if already running
    if (this._isApl) {
      this._reApply = true
      return Promise.resolve(false)
    }
    this._isApl = true

    let stopCriteria = false
    const received = []

    const handleMessage = (msg) => {
      if (msg.context === 'leader' && msg.token !== this.token) {
        received.push(msg)

        if (msg.action === 'apply') {
          // other is applying
          if (msg.token > this.token) {
            // other has higher token, stop applying
            stopCriteria = true
          }
        }

        if (msg.action === 'tell') {
          // other is already leader
          stopCriteria = true
        }
      }
    }
    this._channel.addEventListener('internal', handleMessage)

    const ret = _sendMessage(this, 'apply') // send out that this one is applying
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
        this._isApl = false
        if (!success && this._reApply) {
          this._reApply = false
          return this.applyOnce()
        } else return success
      })
    return ret
  }

  awaitLeadership () {
    if (
      /* _awaitLeadershipPromise */
      !this._aLP
    ) {
      this._aLP = _awaitLeadershipOnce(this)
    }
    return this._aLP
  }

  set onduplicate (fn) {
    this._dpL = fn
  }

  get onduplicate () {
    return this._dpL
  }

  die () {
    if (this.isDead) return
    this.isDead = true

    this._channel.postMessage(['unregister', this.token])
    this._lstns.forEach(listener => this._channel.removeEventListener('internal', listener))
    this._invs.forEach(interval => clearInterval(interval))
    this._unl.forEach(uFn => {
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
      if (resolved) {
        return
      }
      resolved = true
      clearInterval(interval)
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
    const interval = setInterval(() => {
      leaderElector.applyOnce().then(() => {
        if (leaderElector.isLeader) {
          finish()
        }
      })
    }, leaderElector._options.fallbackInterval)
    leaderElector._invs.push(interval)

    // try when other leader dies
    const whenDeathListener = msg => {
      if (msg.context === 'leader' && msg.action === 'death') {
        leaderElector.applyOnce().then(() => {
          if (leaderElector.isLeader) finish()
        })
      }
    }
    leaderElector._channel.addEventListener('internal', whenDeathListener)
    leaderElector._lstns.push(whenDeathListener)
  })
}

/**
 * sends and internal message over the broadcast-channel
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
  const unloadFn = () => leaderElector.die()
  if (IS_BROWSER) {
    window.addEventListener('beforeUnload', unloadFn)
    window.addEventListener('unload', unloadFn)
  }

  leaderElector._unl.push(['beforeUnload', unloadFn])
  leaderElector._unl.push(['unload', unloadFn])

  const isLeaderListener = msg => {
    if (msg.context === 'leader' && msg.action === 'apply') {
      _sendMessage(leaderElector, 'tell')
    }

    if (msg.context === 'leader' && msg.action === 'tell' && !leaderElector._dpLC) {
      /**
       * another instance is also leader!
       * This can happen on rare events
       * like when the CPU is at 100% for long time
       * or the tabs are open very long and the browser throttles them.
       * @link https://github.com/pubkey/broadcast-channel/issues/414
       * @link https://github.com/pubkey/broadcast-channel/issues/385
       */
      leaderElector._dpLC = true
      leaderElector._dpL() // message the lib user so the app can handle the problem
      _sendMessage(leaderElector, 'tell') // ensure other leader also knows the problem
    }
  }
  leaderElector._channel.addEventListener('internal', isLeaderListener)
  leaderElector._lstns.push(isLeaderListener)
  return _sendMessage(leaderElector, 'tell')
}

export function createLeaderElection (channel, options) {
  if (channel._leaderElector) {
    throw new Error('BroadcastChannel already has a leader-elector')
  }

  const elector = new LeaderElection(channel, options)
  channel._befC.push(() => elector.die())

  channel._leaderElector = elector
  return elector
}
