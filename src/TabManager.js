import { MessageChannel, createLeaderElection } from './MessageChannel'
export const TabManager = ({
  type,
  channelName,
  fallbackInterval,
  responseTime,
  emitOnAllTabs,
  onIdle,
  onActive,
  start,
  reset,
  pause,
  resume
}) => {
  const channel = new MessageChannel(channelName, { type })
  const elector = createLeaderElection(channel, { fallbackInterval, responseTime })
  const registry = {}

  // Register self
  registry[elector.token] = false

  let leader = false
  let allIdle = true

  const isLeader = () => leader

  elector.awaitLeadership().then(() => {
    leader = true
  })

  channel.addEventListener('message', ([type, id]) => {
    switch (type) {
      case 'register':
        registry[id] = false
        break
      case 'unregister':
        delete registry[id]
        break
      case 'idle':
        idle(id)
        break
      case 'active':
        active(id)
        break
      case 'emitIdle':
        onIdle()
        break
      case 'emitActive':
        onActive()
        break
      case 'start':
        start(true)
        break
      case 'reset':
        reset(true)
        break
      case 'pause':
        pause(true)
        break
      case 'resume':
        resume(true)
        break
      default:
        // no op
    }
  })

  const setAllIdle = bool => {
    allIdle = bool
  }

  const isAllIdle = () => allIdle

  const idle = (id = elector.token) => {
    registry[id] = true
    const idle = Object.values(registry).every(v => v)
    if (!allIdle && idle) {
      allIdle = true
      if (isLeader()) {
        onIdle()
        if (emitOnAllTabs) send('emitIdle')
      } else {
        send('idle')
      }
    }
  }

  const active = (id = elector.token) => {
    registry[id] = false
    const active = Object.values(registry).some(v => !v)
    if (allIdle && active) {
      allIdle = false
      if (isLeader()) {
        onActive()
        if (emitOnAllTabs) send('emitActive')
      } else {
        send('active')
      }
    }
  }

  /* istanbul ignore next */
  elector.onDuplicate = async () => await elector.die()
  elector.onBeforeDie = () => send('unregister')

  const send = message => {
    if (!channel.isClosed()) channel.postMessage([message, elector.token])
  }

  const close = async () => {
    await elector.die()
    await channel.close()
  }

  // Register self with remote tabs
  send('register')

  return { close, send, isLeader, idle, active, isAllIdle, setAllIdle }
}
