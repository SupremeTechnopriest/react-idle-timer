import BroadcastMessageMethod from './methods/broadcast-message'
import LocalStorageMethod from './methods/local-storage'
import SimulateMethod from './methods/simulate'

// order is important
const METHODS = [
  BroadcastMessageMethod,
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
  if (!useMethod) {
    throw new Error(`❌ No method found ${JSON.stringify(METHODS.map(m => m.type))}`)
  }
  return useMethod
}
