export interface IIdleTimer {
  /**
   * Restore initial state and restart timer. Does not call onActive.
   */
  start(): void

  /**
   * Restore initial state and restart timer. Calls onActive.
   */
  reset(): void

  /**
   * Store remaining time and stop timer.
   *
   * @returns Wether or not the instance was paused.
   */
  pause(): boolean

  /**
   * Resumes a paused timer.
   *
   * @returns Wether or not the instance was resumed.
   */
  resume(): boolean

  /**
   * Broadcast an arbitrary message to all instances of IdleTimer.
   *
   * @param data  Data to emit to `onMessage` callbacks.
   * @param emitOnSelf  Emit the event on the callee instance.
   */
  message(data: string | number | object, emitOnSelf?: boolean): void

  /**
  * Returns wether or not the user is idle.
  *
  * @returns Idle state.
  */
  isIdle(): boolean

  /**
   * Returns wether or not the prompt is active.
   *
   * @returns Prompted state.
   */
  isPrompted(): boolean

  /**
   * Time remaining before idle or prompt.
   *
   * @returns Number of milliseconds until idle or prompt.
   */
  getRemainingTime(): number

  /**
   * Time elapsed since last reset.
   *
   * @returns Number of milliseconds since the hook was last reset.
   */
  getElapsedTime(): number

  /**
   * Time elapsed since mounted.
   *
   * @returns Number of milliseconds since the hook was mounted.
   */
  getTotalElapsedTime(): number

  /**
   * Last time the user was idle.
   *
   * @returns A Date object that can be formatted.
   */
  getLastIdleTime(): Date | null

  /**
   * Last time the user was active.
   *
   * @returns A Date object that can be formatted.
   */
  getLastActiveTime(): Date | null

  /**
   * Total time in milliseconds user has been idle.
   *
   * @returns Time in milliseconds the user has been idle.
   */
  getTotalIdleTime(): number

  /**
   * Total time in milliseconds user has been active.
   *
   * @returns Time in milliseconds the user has been active.
   */
  getTotalActiveTime(): number
}
