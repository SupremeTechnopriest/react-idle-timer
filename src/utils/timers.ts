import * as workerTimers from 'worker-timers'

export const timers = {
  setTimeout: workerTimers.setTimeout,
  clearTimeout: workerTimers.clearTimeout,
  setInterval: workerTimers.setInterval,
  clearInterval: workerTimers.clearInterval
}

export async function createMocks () {
  timers.setTimeout = setTimeout
  timers.clearTimeout = clearTimeout
  timers.setInterval = setInterval
  timers.clearInterval = clearInterval
}
