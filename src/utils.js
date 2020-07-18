/**
 * Determine if we are in a browser
 * or a server environment
 * @type {Boolean}
 * @private
 */
export const IS_BROWSER =
  (typeof window === 'undefined' ? 'undefined' : typeof window) === 'object'

/**
 * Default element to listen for events on
 * @type {Object}
 * @private
 */
export const DEFAULT_ELEMENT = IS_BROWSER ? document : {}

/**
 * The default events to determine activity
 * @type {Array}
 * @private
 */
export const DEFAULT_EVENTS = [
  'mousemove',
  'keydown',
  'wheel',
  'DOMMouseScroll',
  'mouseWheel',
  'mousedown',
  'touchstart',
  'touchmove',
  'MSPointerDown',
  'MSPointerMove',
  'visibilitychange'
]

/**
 * Creates a debounced function that delays invoking func until
 * after delay milliseconds has elapsed since the last time the
 * debounced function was invoked.
 * @name debounced
 * @param  {Function} fn   Function to debounce
 * @param  {Number} delay  How long to wait
 * @return {Function}      Executed Function
 * @private
 **/
export function debounced (fn, delay) {
  let timerId
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }
}

/**
 * Creates a throttled function that only invokes func at most
 * once per every wait milliseconds.
 * @name throttled
 * @param  {Function} fn   Function to debounce
 * @param  {Number} delay  How long to wait
 * @return {Function}      Executed Function
 * @private
 **/
export function throttled (fn, delay) {
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
