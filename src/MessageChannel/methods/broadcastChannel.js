/* eslint-env browser */
import { microSeconds } from '../../utils'

export const type = 'broadcastChannel'

export function create (channelName) {
  const state = {
    messagesCallback: null,
    bc: new BroadcastChannel(channelName)
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
}

export function postMessage (channelState, messageJson) {
  try {
    channelState.bc.postMessage(messageJson, false)
    return Promise.resolve()
  } catch (err) {
    /* istanbul ignore next */
    return Promise.reject(err)
  }
}

export function onMessage (channelState, fn) {
  channelState.messagesCallback = fn
}

export function canBeUsed () {
  if (typeof BroadcastChannel === 'function') {
    return true
  } else {
    /* istanbul ignore next */
    return false
  }
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
