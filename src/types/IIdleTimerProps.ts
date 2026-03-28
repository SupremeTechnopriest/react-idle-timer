import { RefObject } from 'react'
import { EventsType } from './EventsType'
import { PresenceType } from './PresenceType'
import { IIdleTimer } from './IIdleTimer'
import { ITimers } from './ITimers'

export interface IIdleTimerProps {
  /**
   * IdleTimer ref for class components.
   *
   * @default undefined
   */
  ref?: RefObject<IIdleTimer>

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
   * @deprecated use promptBeforeIdle
   */
  promptTimeout?: number

  /**
   * The amount of milliseconds before timeout to call the onPrompt event handler.
   *
   * @default 0
   */
  promptBeforeIdle?: number

  /**
   * Element to bind activity listeners to.
   *
   * @default document
   */
  element?: Document | HTMLElement

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
   * Function to call when the users presence state changes.
   *
   * @default () => {}
   */
  onPresenceChange?: (presence: PresenceType, idleTimer?: IIdleTimer) => void

  /**
   * When promptTimeout is set, this function is called after the user becomes
   * idle. This is useful for displaying a confirm prompt. If the prompt timeout
   * is reached, onIdle is then called.
   *
   * @default () => {}
   */
  onPrompt?: (event?: Event, idleTimer?: IIdleTimer) => void

  /**
   * Function to call when user is idle.
   *
   * @default () => {}
   */
  onIdle?: (event?: Event, idleTimer?: IIdleTimer) => void

  /**
   * Function to call when user becomes active.
   *
   * @default () => {}
   */
  onActive?: (event?: Event, idleTimer?: IIdleTimer) => void

  /**
   * Function to call on user activity. Can be throttled or debounced using the
   * `throttle` and `debounce` props.
   *
   * @default () => {}
   */
  onAction?: (event?: Event, idleTimer?: IIdleTimer) => void

  /**
   * Function to call when message is has been emitted, when `crossTab` is set
   * to `true`.
   *
   * @default () => {}
   */
  onMessage?: (data: any, idleTimer?: IIdleTimer) => void

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
   * Timer interface to use. By default the main thread timers are used to keep
   * the module tree shakeable. If you want to use worker timers, import them
   * and set them here.
   *
   * @default Main Thread Timers
   */
  timers?: ITimers

  /**
   * Enable cross tab event replication.
   *
   * @default false
   */
  crossTab?: boolean

  /**
   * Name of this IdleTimer instance. Useful if you are instantiating multiple
   * IdleTimer instances with `crossTab` enabled.
   */
  name?: string

  /**
   * Sync the timers across all tabs,, when `crossTab` is set to `true`. The value
   * is the interval in which timers will be synced. Setting it to 0 is equivalent
   * to turning the feature off. A good baseline value would be 200(ms).
   *
   * Generally, set either this or `leaderElection: true`, not both.
   * If you want all your tabs to be in the same state, use `syncTimers`
   *
   * @default 0
   */
  syncTimers?: number

  /**
   * Enables the leader election feature, when `crossTab` is set to `true`.
   * Leader Election will assign one tab to be the leader. Determine if a tab
   * is leader using the `isLeader` method.
   *
   * Generally, set either this or `syncTimers`, not both.
   * If you want your events to fire only in one tab, use `leaderElection`
   *
   * @default false
   */
  leaderElection?: boolean

  /**
   * Disables the timer. Disabling the timer resets the internal state.
   * When the property is set to true (enabled), the timer will be restarted,
   * respecting the `startManually` property. When the timer is disabled
   * the control methods `start`, `reset`, `activate`, `pause` and `resume`
   * will not do anything.
   */
  disabled?: boolean
}
