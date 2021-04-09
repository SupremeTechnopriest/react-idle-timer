import { now } from '../utils'

export default class ObliviousSet {
  constructor (ttl = 1000 * 60) {
    this.ttl = ttl
    this.set = new Set()
    this.timeMap = new Map()
  }

  has (value) {
    return this.set.has(value)
  }

  add (value) {
    this.timeMap.set(value, now())
    this.set.add(value)
    this._removeTooOldValues()
  }

  clear () {
    this.set.clear()
    this.timeMap.clear()
  }

  _removeTooOldValues () {
    const olderThen = now() - this.ttl
    const iterator = this.set[Symbol.iterator]()

    while (true) {
      const value = iterator.next().value
      if (!value) return // no more elements
      const time = this.timeMap.get(value)
      if (time < olderThen) {
        this.timeMap.delete(value)
        this.set.delete(value)
      } else {
        // We reached a value that is not old enough
        return
      }
    }
  }
}
