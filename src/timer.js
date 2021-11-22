import * as workerTimers from 'worker-timers'

const isWebWorkerSupported = !!window.Worker && typeof Worker !== 'undefined'

const timer = {}

timer.clearInterval = (intervalId) => {
  if (isWebWorkerSupported) {
    workerTimers.clearInterval(intervalId)
  } else {
    clearInterval(intervalId)
  }
}

timer.clearTimeout = (timeoutId) => {
  if (isWebWorkerSupported) {
    workerTimers.clearTimeout(timeoutId)
  } else {
    clearTimeout(timeoutId)
  }
}

timer.setInterval = (callback, delay) => {
  if (isWebWorkerSupported) {
    workerTimers.setInterval(callback, delay)
  } else {
    setInterval(callback, delay)
  }
}

timer.setTimeout = (callback, delay) => {
  if (isWebWorkerSupported) {
    workerTimers.setTimeout(callback, delay)
  } else {
    setTimeout(callback, delay)
  }
}

export default timer
