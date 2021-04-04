import { BroadcastChannel, createLeaderElection } from './manager'
export const TabManager = ({
  type,
  channelName,
  fallbackInterval,
  responseTime,
  onIdle,
  onActive
}) => {
  const channel = new BroadcastChannel(channelName, { type })
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
      default:
        // no op
    }
  })

  const setAllIdle = bool => {
    allIdle = bool
  }

  const idle = (id = elector.token) => {
    registry[id] = true
    if (isLeader()) {
      const idle = Object.values(registry).every(v => v)
      if (!allIdle && idle) {
        allIdle = true
        onIdle()
      }
    }
  }

  const active = (id = elector.token) => {
    registry[id] = false
    if (isLeader()) {
      const active = Object.values(registry).some(v => !v)
      if (allIdle && active) {
        allIdle = false
        onActive()
      }
    }
  }

  elector.onduplicate = async () => await elector.die()

  const send = message => {
    if (!channel.isClosed()) channel.postMessage([message, elector.token])
  }

  const close = async () => {
    await elector.die()
    await channel.close()
  }

  return { close, send, isLeader, idle, active, setAllIdle }
}
