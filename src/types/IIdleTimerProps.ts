import { EventsType } from './EventsType'
import { IIdleTimer } from './IIdleTimer'

export interface IIdleTimerProps {
  /**
   * IdleTimer ref for class components.
   *
   * @default undefined
   */
  ref?: (ref: IIdleTimer) => void

  /**
   * Activity Timeout in milliseconds.
   *
   * @default 1200000
   */
  timeout?: number

  /**
   * When the user becomes idle, the onPrompt function is called and
   * after the prompt timeout in milliseconds is reached, the onIdle function
   * is called.
   *
   * @default 0
   */
  promptTimeout?: number

  /**
   * DOM events to watch for activity on.
   *
   * @default DefaultEvents
   * @link [default events](https://idletimer.dev/docs/props#events).
   */
  events?: EventsType[]

  /**
   * DOM events that will bypass the timeout and immediately emit onPrompt/onIdle
   * events. The events in this array take precedence over the events array.
   *
   * @default []
   */
  immediateEvents?: EventsType[]

  /**
   * When promptTimeout is set, this function is called after the user becomes
   * idle. This is useful for displaying a confirm prompt.  If the prompt timeout
   * is reached, onIdle is then called.
   *
   * @default () -> {}
   */
  onPrompt?: () => void

  /**
   * Function to call when user is idle.
   *
   * @default () -> {}
   */
  onIdle?: () => void

  /**
   * Function to call when user becomes active.
   *
   * @default () -> {}
   */
  onActive?: (event?: Event) => void

  /**
   * Function to call on user activity.
   *
   * @default () -> {}
   */
  onAction?: (event?: Event) => void

  /**
   * Function to call when message is has been emitted.
   *
   * @default () => {}
   */
  onMessage?: (data: any) => void

  /**
   * Debounce the onAction function by setting delay in milliseconds.
   *
   * @default 0
   */
  debounce?: number

  /**
   * Throttle the onAction function by setting delay in milliseconds.
   *
   * @default 0
   */
  throttle?: number

  /**
   * Throttle the activity events. Useful if you are listening to mouse events.
   * Helps to cut down on cpu usage.
   *
   * @default 200
   */
  eventsThrottle?: number

  /**
   * Element to bind activity listeners to.
   *
   * @default document
   */
  element?: Node

  /**
   * Start the timer when the hook mounts.
   *
   * @default true
   */
  startOnMount?: boolean

  /**
   * Require the timer to be started manually.
   *
   * @default false
   */
  startManually?: boolean

  /**
   * Once the user goes idle the IdleTimer will not reset on user input instead,
   * start() or reset() must be called manually to restart the timer.
   *
   * @default false
   */
  stopOnIdle?: boolean

  /**
   * Enable cross tab event replication.
   *
   * @default false
   */
  crossTab?: boolean

  /**
   * By default, events are only emitted on the leader tab when crossTab is enabled.
   * Enabling this option will emit events on all tabs.
   *
   * @default false
   */
  emitOnAllTabs?: boolean
}
