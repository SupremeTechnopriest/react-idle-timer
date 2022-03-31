import { timers } from './timers'

/**
 * Sleeps for x amount of milliseconds.
 *
 * @param time   Amount of time in milliseconds.
 * @returns Promise resolving timeout id.
 * @private
 */
export function sleep (time: number = 0): Promise<void> {
  return new Promise(resolve => timers.setTimeout(resolve, time))
}
