interface IDebouncedFn {
  (...args: any[]): any
  cancel: () => void
}

/**
 * Creates a debounced function that delays invoking func until
 * after delay milliseconds has elapsed since the last time the
 * debounced function was invoked.
 *
 * @param fn  Function to debounce
 * @param delay  How long to wait
 * @return Executed Function
 * @private
 **/
export function debounceFn (fn: (...args) => any, delay: number): IDebouncedFn {
  let timerId
  function result (...args) {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }

  result.cancel = function () {
    clearTimeout(timerId)
  }

  return result
}
