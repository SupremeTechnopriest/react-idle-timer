/// <reference types='react'/>

declare module 'react-idle-timer' {
  import * as React from 'react'

  export type EVENTS =
    'abort' |
    'afterprint' |
    'animationend' |
    'animationiteration' |
    'animationstart' |
    'beforeprint' |
    'beforeunload' |
    'blur' |
    'canplay' |
    'canplaythrough' |
    'change' |
    'click' |
    'contextmenu' |
    'copy' |
    'cut' |
    'dblclick' |
    'DOMMouseScroll' |
    'drag' |
    'dragend' |
    'dragenter' |
    'dragleave' |
    'dragover' |
    'dragstart' |
    'drop' |
    'durationchange' |
    'ended' |
    'error' |
    'focus' |
    'focusin' |
    'focusout' |
    'fullscreenchange' |
    'fullscreenerror' |
    'hashchange' |
    'input' |
    'invalid' |
    'keydown' |
    'keypress' |
    'keyup' |
    'load' |
    'loadeddata' |
    'loadedmetadata' |
    'loadstart' |
    'message' |
    'mousedown' |
    'mouseenter' |
    'mouseleave' |
    'mousemove' |
    'mouseover' |
    'mouseout' |
    'mouseup' |
    'mousewheel' |
    'MSPointerDown' |
    'MSPointerMove' |
    'offline' |
    'online' |
    'open' |
    'pagehide' |
    'pageshow' |
    'paste' |
    'pause' |
    'play' |
    'playing' |
    'popstate' |
    'progress' |
    'ratechange' |
    'resize' |
    'reset' |
    'scroll' |
    'search' |
    'seeked' |
    'seeking' |
    'select' |
    'show' |
    'stalled' |
    'storage' |
    'submit' |
    'suspend' |
    'timeupdate' |
    'toggle' |
    'touchcancel' |
    'touchend' |
    'touchmove' |
    'touchstart' |
    'transitionend' |
    'unload' |
    'volumechange' |
    'waiting' |
    'wheel' |
    'visibilitychange'

  export type ManagerType = 'broadcastChannel' | 'localStorage' | 'simulate'

  export default class IdleTimer extends React.Component<IdleTimerClassProps> {
    /**
     * Alias to reset.
     */
    start(): void
    
    /**
     * Restore initial state and restart timer.
     */
    reset(): void

    /**
     * Store remaining time and stop timer.
     */
    pause(): void

    /**
     * Resumes a paused timer.
     */
    resume(): void

    /**
     * Returns wether or not the user is idle.
     */
    isIdle(): boolean

    /**
     * Returns wether or not this is the leader tab.
     */
    isLeader(): boolean

    /**
     * Time remaining before idle (number of ms).
     */
    getRemainingTime(): number

    /**
     * How much time has elapsed (timestamp).
     */
    getElapsedTime(): number

    /**
     * Last time the user was idle.
     */
    getLastIdleTime(): number

    /**
     * Last time the user was active.
     */
    getLastActiveTime(): number

    /**
     * Total time in milliseconds user was idle.
     */
    getTotalIdleTime(): number

    /**
     * Total time in milliseconds user was active.
     */
    getTotalActiveTime(): number
  }

  interface CrossTabInterface {
    /**
     * Manager type. Selected automatically if left undefined. 
     */
    type?: ManagerType

    /**
     * Broadcast Channel name. Default: idle-timer.
     */
    channelName?: string

    /**
     * How often renegotiation for leader will occur. Default: 2000.
     */
    fallbackInterval?: number
    
    /**
     * How long tab instances will have to respond. Default: 100.
     */
    responseTime?: number
    
    /**
     * LocalStorage item time to live. Default: 60000.
     */
    removeTimeout?: number

    /**
     * Emits events on all tabs. Default: false.
     */
    emitOnAllTabs?: boolean
  }

  interface IdleTimerClassProps extends IdleTimerProps {
    /**
     * React reference to the IdleTimer Component instance.
     */
    ref?: (ref: IdleTimer) => any
  }

  interface IdleTimerProps {
    /**
     * Activity Timeout in milliseconds. Default: 1200000.
     */
    timeout?: number

    /**
     * DOM events to listen to. Default: see [default events](https://github.com/SupremeTechnopriest/react-idle-timer#default-events).
     */
    events?: EVENTS[]

    /**
     * Function to call when user is idle.
     */
    onIdle?: (e: Event) => void

    /**
     * Function to call when user becomes active.
     */
    onActive?: (e: Event) => void

    /**
     * Function to call when user have an activity.
     */
    onAction?: (e: Event) => void

    /**
     * Debounce the onAction function by setting delay in milliseconds. Default: 0.
     */
    debounce?: number

    /**
     * Throttle the onAction function by setting delay in milliseconds. Default: 0.
     */
    throttle?: number

    /**
     * Throttle the activity events. Useful if you are listening to mouse events. 
     * Helps to cut down on cpu usage. Default: 200
     */
    eventsThrottle?: number

    /**
     * Element reference to bind activity listeners to. Default: document.
     */
    element?: Node

    /**
     * Start the timer on mount. Default: true.
     */
    startOnMount?: boolean
    
    /**
     * Require the timer to be started manually. Default: false.
     */
    startManually?: boolean

    /**
     * Once the user goes idle the IdleTimer will not reset on user input instead, 
     * reset() must be called manually to restart the timer. Default: false.
     */
    stopOnIdle?: boolean

    /**
     * Bind events passively. Default: true.
     */
    passive?: boolean

    /**
     * Capture events. Default: true.
     */
    capture?: boolean

    /** 
     * Cross Tab options: Default: false.
     */
    crossTab?: boolean|CrossTabInterface
  }

  interface IdleTimerAPI {
    /**
     * Alias to reset.
     */
    start(): void
    
    /**
     * Restore initial state and restart timer
     */
    reset(): void

    /**
     * Store remaining time and stop timer
     */
    pause(): void

    /**
     * Resumes a paused timer
     */
    resume(): void

    /**
    * Returns wether or not the user is idle
    */
    isIdle(): boolean

    /**
     * Returns wether or not this is the leader tab
     */
    isLeader(): boolean

    /**
     * Time remaining before idle (number of ms)
     */
    getRemainingTime(): number

    /**
     * How much time has elapsed (timestamp)
     */
    getElapsedTime(): number

    /**
     * Last time the user was idle
     */
    getLastIdleTime(): number

    /**
     * Last time the user was active
     */
    getLastActiveTime(): number

    /**
     * Total time in milliseconds user was idle
     */
    getTotalIdleTime(): number

    /**
     * Total time in milliseconds user was active
     */
    getTotalActiveTime(): number
  }

  export function useIdleTimer(props: IdleTimerProps): IdleTimerAPI
}

declare module 'react-idle-timer/modern' {
  export * from 'react-idle-timer'
}

declare module 'react-idle-timer/dist/modern' {
  export * from 'react-idle-timer'
}