export interface IIdleTimer {
  /**
   * Restore initial state and restart timer.
   *
   * @returns whether the instance was started.
   */
  start(): boolean

  /**
   * Restore initial state.
   *
   * @returns whether the instance was reset.
   */
  reset(): boolean

  /**
   * Restore initial state and emit onActive if the user was prompted or idle.
   *
   * @returns whether the instance was activated.
   */
  activate(): boolean

  /**
   * Store remaining time and stop timer.
   *
   * @returns whether the instance was paused.
   */
  pause(): boolean

  /**
   * Resumes a paused timer.
   *
   * @returns whether the instance was resumed.
   */
  resume(): boolean

  /**
   * Broadcast an arbitrary message to all instances of IdleTimer.
   *
   * @param data  Data to emit to `onMessage` callbacks.
   * @param emitOnSelf  Emit the event on the callee instance.
   *
   * @returns whether the message was sent.
   */
  message(data: string | number | object, emitOnSelf?: boolean): boolean

  /**
  * Returns whether the user is idle.
  *
  * @returns Idle state.
  */
  isIdle(): boolean

  /**
   * Returns whether the current tab is the leader.
   *
   * @returns Leader state.
   */
  isLeader(): boolean

  /**
   * Returns whether the prompt is active.
   *
   * @returns Prompted state.
   */
  isPrompted(): boolean

  /**
   * Returns whether this is the last active tab.
   *
   * @returns Last active state.
   */
  isLastActiveTab(): boolean

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
   * Time in milliseconds user has been idle since last reset.
   *
   * @returns Time in milliseconds the user has been idle.
   */
  getIdleTime(): number

  /**
   * Total time in milliseconds user has been idle since the hook mounted.
   *
   * @returns Time in milliseconds the user has been idle.
   */
  getTotalIdleTime(): number

  /**
   * Total time in milliseconds user has been active since last reset.
   *
   * @returns Time in milliseconds the user has been active.
   */
  getActiveTime(): number

  /**
   * Total time in milliseconds user has been active since the hook mounted.
   *
   * @returns Time in milliseconds the user has been active.
   */
  getTotalActiveTime(): number
}
