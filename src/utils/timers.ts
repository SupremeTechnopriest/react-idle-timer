import * as worker from 'worker-timers'
import { ITimers } from '../types/ITimers'

export const timers: ITimers = {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval
}

export const workerTimers: ITimers = {
  setTimeout: worker.setTimeout,
  clearTimeout: worker.clearTimeout,
  setInterval: worker.setInterval,
  clearInterval: worker.clearInterval
}

export function createMocks () {
  timers.setTimeout = setTimeout
  timers.clearTimeout = clearTimeout
  timers.setInterval = setInterval
  timers.clearInterval = clearInterval
}

export function setTimers (customTimers: ITimers): void {
  timers.setTimeout = customTimers.setTimeout
  timers.clearTimeout = customTimers.clearTimeout
  timers.setInterval = customTimers.setInterval
  timers.clearInterval = customTimers.clearInterval
}
