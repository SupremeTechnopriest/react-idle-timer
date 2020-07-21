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
    'wheel'

  export default class IdleTimer extends React.Component<IdleTimerProps> {
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
     * Time remaining before idle (number of ms)
     */
    getRemainingTime(): number

    /**
     * How much time has elapsed (timestamp)
     */
    getElapsedTime(): number

    /**
     * Last time the user was active
     */
    getLastActiveTime(): number

    /**
     * Returns wether or not the user is idle
     */
    isIdle(): boolean
  }

  interface IdleTimerProps {
    /**
     * Activity Timeout in milliseconds default: 1200000
     */
    timeout?: number

    /**
     * DOM events to listen to default: see [default events](https://github.com/SupremeTechnopriest/react-idle-timer#default-events)
     */
    events?: EVENTS[]

    /**
     * Function to call when user is idle
     */
    onIdle?: (e: Event) => void

    /**
     * Function to call when user becomes active
     */
    onActive?: (e: Event) => void

    /**
     * Function to call when user have an activity
     */
    onAction?: (e: Event) => void

    /**
     * Debounce the onAction function by setting delay in milliseconds default: 0
     */
    debounce?: number

    /**
     * Throttle the onAction function by setting delay in milliseconds default: 0
     */
    throttle?: number

    /**
     * Throttle the activity events. Useful if you are listening to mouse events. 
     * Helps to cut down on cpu usage. Default: 200
     */
    eventsThrottle?: number

    /**
     * Element reference to bind activity listeners to default: document
     */
    element?: Node

    /**
     * Start the timer on mount default: true
     */
    startOnMount?: boolean

    /**
     * Once the user goes idle the IdleTimer will not reset on user input instead, reset() must be called manually to restart the timer default: false
     */
    stopOnIdle?: boolean

    /**
     * Bind events passively default: true
     */
    passive?: boolean

    /**
     * Capture events default: true
     */
    capture?: boolean
  }

  interface IdleTimerAPI {
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
     * Time remaining before idle (number of ms)
     */
    getRemainingTime(): number

    /**
     * How much time has elapsed (timestamp)
     */
    getElapsedTime(): number

    /**
     * Last time the user was active
     */
    getLastActiveTime(): number

    /**
     * Returns wether or not the user is idle
     */
    isIdle(): boolean
  }

  export function useIdleTimer(props: IdleTimerProps): IdleTimerAPI
}
