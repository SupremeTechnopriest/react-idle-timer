/* eslint-env browser */
import { microSeconds as micro } from '../../utils'

export const microSeconds = micro

export const type = 'native'

export function create (channelName) {
  const state = {
    messagesCallback: null,
    bc: new BroadcastChannel(channelName),
    subFns: [] // subscriberFunctions
  }

  state.bc.onmessage = msg => {
    if (state.messagesCallback) {
      state.messagesCallback(msg.data)
    }
  }

  return state
}

export function close (channelState) {
  channelState.bc.close()
  channelState.subFns = []
}

export function postMessage (channelState, messageJson) {
  try {
    channelState.bc.postMessage(messageJson, false)
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}

export function onMessage (channelState, fn) {
  channelState.messagesCallback = fn
}

export function canBeUsed () {
  if (typeof BroadcastChannel === 'function') {
    return true
  } else return false
}

export function averageResponseTime () {
  return 150
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
