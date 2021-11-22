import timer from './timer'

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
  'mousewheel',
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
  function result (...args) {
    if (timerId) {
      timer.clearTimeout(timerId)
    }
    timerId = timer.setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }

  result.cancel = function () {
    timer.clearTimeout(timerId)
  }

  return result
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

let lastMs = 0
let additional = 0

/**
 * Returns current time in microseconds.
 *
 * @returns {Number} current time in microseconds
 * @private
 */
export function microSeconds () {
  const ms = new Date().getTime()
  if (ms === lastMs) {
    additional++
    return ms * 1000 + additional
  } else {
    lastMs = ms
    additional = 0
    return ms * 1000
  }
}

/**
 * Generate and return a random token.
 *
 * @returns {String} Random token.
 * @private
 */
export function randomToken () {
  return Math.random().toString(36).substring(2)
}

/**
 * Checks if a js object is a promise.
 *
 * @param {*} obj  Any javascript object.
 * @returns {Boolean} Wether or not this object is a promise.
 */
export function isPromise (obj) {
  if (obj && typeof obj.then === 'function') {
    /* istanbul ignore next */
    return true
  } else {
    return false
  }
}

/**
 * Sleeps for x amount of milliseconds.
 *
 * @param {Number} time   Amount of time in milliseconds.
 * @returns {Promise}
 * @private
 */
export function sleep (time = 0) {
  return new Promise(resolve => timer.setTimeout(resolve, time))
}

/**
 * Get the current timestamp.
 *
 * @returns {Number}
 * @private
 */
export function now () {
  return new Date().getTime()
}

/**
 * Waits until the given function returns true
 * @param  {function}  fn
 * @return {Promise}
 */
export function waitUntil (fn, timeout = 0, interval = 20) {
  let timedOut = false
  let ok = false

  /* istanbul ignore next */
  if (timeout !== 0) {
    sleep(timeout).then(() => {
      timedOut = true
    })
  }

  return new Promise((resolve, reject) => {
    const runLoop = () => {
      if (ok) {
        resolve()
        return
      }
      /* istanbul ignore next */
      if (timedOut) {
        reject(new Error(`❌ waitUntil reached timeout of ${timeout}ms`))
        return
      }
      sleep(interval).then(() => {
        ok = fn()
        runLoop()
      })
    }
    runLoop()
  })
}
