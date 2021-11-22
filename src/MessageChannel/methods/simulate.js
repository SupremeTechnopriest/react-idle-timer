import timer from '../../timer'
import { microSeconds } from '../../utils'

export const type = 'simulate'

const SIMULATE_CHANNELS = new Set()

export function create (channelName) {
  const state = {
    name: channelName,
    messagesCallback: null
  }
  SIMULATE_CHANNELS.add(state)

  return state
}

export function close (channelState) {
  SIMULATE_CHANNELS.delete(channelState)
}

export function postMessage (channelState, messageJson) {
  return new Promise(resolve => timer.setTimeout(() => {
    const channelArray = Array.from(SIMULATE_CHANNELS)
    channelArray
      .filter(channel => channel.name === channelState.name)
      .filter(channel => channel !== channelState)
      .filter(channel => !!channel.messagesCallback)
      .forEach(channel => channel.messagesCallback(messageJson))
    resolve()
  }, 5))
}

export function onMessage (channelState, fn) {
  channelState.messagesCallback = fn
}

/* istanbul ignore next */
export function canBeUsed () {
  return true
}

/* istanbul ignore next */
export function averageResponseTime () {
  return 5
}

export default {
  create,
  close,
  onMessage,
  postMessage,
  canBeUsed,
  type,
  averageResponseTime,
  microSeconds
}
