export interface IIdleTimer {
  /**
   * Restore initial state and restart timer.
   */
  start(): void

  /**
   * Restore initial state.
   */
  reset(): void

  /**
   * Restore initial state and emit onActive is user was idle.
   */
  activate(): void

  /**
   * Store remaining time and stop timer.
   *
   * @returns whether or not the instance was paused.
   */
  pause(): boolean

  /**
   * Resumes a paused timer.
   *
   * @returns whether or not the instance was resumed.
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
  * Returns whether or not the user is idle.
  *
  * @returns Idle state.
  */
  isIdle(): boolean

  /**
   * Returns whether or not the current tab is the leader.
   *
   * @returns Leader state.
   */
  isLeader(): boolean

  /**
   * Returns whether or not the prompt is active.
   *
   * @returns Prompted state.
   */
  isPrompted(): boolean

  /**
   * Returns the current tabs id.
   */
  getTabId(): string

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

  /**
   * Returns whether or not the current tab is the most recently active.
   *
   * @returns Last Active State.
   */
  isLastActiveTab(): boolean
}
