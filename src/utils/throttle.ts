import { FnType } from '../types/FnType'

/**
 * Creates a throttled function that only invokes func at most
 * once per every wait milliseconds.
 *
 * @param fn  Function to debounce
 * @param delay  How long to wait
 * @return Executed Function
 * @private
 **/
export function throttleFn (fn: FnType, delay: number): FnType {
  let lastCall = 0
  return function (...args) {
    const now = new Date().getTime()
    if (now - lastCall < delay) {
      return
    }
    lastCall = now
    return fn(...args)
  }
}
