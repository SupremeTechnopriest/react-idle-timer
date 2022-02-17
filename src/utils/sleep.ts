import * as workerTimers from 'worker-timers'

/**
 * Sleeps for x amount of milliseconds.
 *
 * @param time   Amount of time in milliseconds.
 * @returns Promise resolving timeout id.
 * @private
 */
export function sleep (time: number = 0): Promise<number> {
  return new Promise(resolve => workerTimers.setTimeout(resolve, time))
}
