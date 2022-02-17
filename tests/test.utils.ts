/**
 * Sleeps for x amount of milliseconds.
 *
 * @param time   Amount of time in milliseconds.
 * @returns Promise resolving timeout id.
 * @private
 */
export function sleep (time: number = 0): Promise<number> {
  return new Promise(resolve => setTimeout(resolve, time))
}

interface IWaitForOptions {
  timeout?: number
  interval?: number
}

/**
 * Waits for the given function to return true.
 *
 * @param fn Function to check
 * @param opts Options
 * @param opts.timeout Timeout before test fails
 * @param opts.interval Interval to check function
 * @return {Promise}
 */
export async function waitFor (fn: (...args: any[]) => boolean, options: IWaitForOptions = { timeout: 1000, interval: 50 }): Promise<void> {
  let elapsed = 0

  const run = async () => {
    if (elapsed >= options.timeout) {
      throw new Error(`❌ waitFor reached timeout of ${options.timeout}ms`)
    }

    if (fn()) return
    await sleep(options.interval)
    elapsed += options.interval
    await run()
  }

  await run()
}
