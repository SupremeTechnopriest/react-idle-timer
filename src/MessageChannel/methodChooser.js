import BroadcastChannelMethod from './methods/broadcastChannel'
import LocalStorageMethod from './methods/localStorage'
import SimulateMethod from './methods/simulate'

// Order is important
const METHODS = [
  BroadcastChannelMethod,
  LocalStorageMethod
]

export function chooseMethod (options = {}) {
  if (options.type) {
    // For testing
    if (options.type === 'simulate') {
      return SimulateMethod
    }

    // Chosen type
    const method = METHODS.find(m => m.type === options.type)
    if (!method) throw new Error(`❌ Method ${options.type} is not supported.`)
    else return method
  }

  const useMethod = METHODS.find(method => method.canBeUsed())

  /* istanbul ignore next */
  if (!useMethod) {
    throw new Error(`❌ No method found ${JSON.stringify(METHODS.map(m => m.type))}`)
  }
  return useMethod
}
