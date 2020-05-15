/**
 *  ___    _ _     _____ _
 * |_ _|__| | | __|_   _(_)_ __ ___   ___ _ __
 *  | |/ _` | |/ _ \| | | | '_ ` _ \ / _ \ '__|
 *  | | (_| | |  __/| | | | | | | | |  __/ |
 * |___\__,_|_|\___||_| |_|_| |_| |_|\___|_|
 *
 * @name useIdleTimer
 * @author Randy Lebeau
 * @private
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { IS_BROWSER, DEFAULT_ELEMENT, DEFAULT_EVENTS, debounced, throttled } from './utils'

/**
 * Detects when your user is idle
 * @function useIdleTimer
 * @private
 */
export default function useIdleTimer ({
  timeout = 1000 * 60 * 20,
  element = DEFAULT_ELEMENT,
  events = DEFAULT_EVENTS,
  onIdle = () => {},
  onActive = () => {},
  onAction = () => {},
  debounce = 0,
  throttle = 0,
  startOnMount = true,
  stopOnIdle = false,
  capture = true,
  passive = true
} = {}) {
  // State
  const [isIdle, setIsIdle] = useState(false)
  const [oldDate, setOldDate] = useState(+new Date())
  const [lastActive, setLastActive] = useState(+new Date())
  const [remaining, setRemaining] = useState(null)
  const [pageX, setPageX] = useState(null)
  const [pageY, setPageY] = useState(null)
  const [eventsBound, setEventsBound] = useState(false)

  /**
   * Store remaining time and stop timer
   * @name pause
   */
  const pause = () => {
    // Timer is already paused
    if (remaining !== null) {
      return
    }
    // Unbind events
    _unbindEvents()
    // Clear existing timeout
    clearTimeout(tId.current)
    tId.current = null
    // Define how much is left on the timer
    setRemaining(getRemainingTime())
  }

  /**
   * Resumes a paused timer
   * @name resume
   */
  const resume = () => {
    // Timer is not paused
    if (remaining === null) return
    // Bind events
    _bindEvents()
    // Start timer and clear remaining
    // if we are in the idle state
    if (!isIdle) {
      setRemaining(null)
      setLastActive(+new Date())
      // Set a new timeout
      tId.current = setTimeout(_toggleIdleState, remaining)
    }
  }

  /**
   * Time remaining before idle
   * @name getRemainingTime
   * @return {Number} Milliseconds remaining
   */
  const getRemainingTime = () => {
    // If idle there is no time remaining
    if (remaining !== null) {
      return remaining < 0 ? 0 : remaining
    }

    // Determine remaining, if negative idle didn't finish flipping, just return 0
    const timeLeft = timeout - (+new Date() - lastActive)
    return timeLeft < 0 ? 0 : timeLeft
  }

  /**
   * How much time has elapsed
   * @name getElapsedTime
   * @return {Timestamp}
   */
  const getElapsedTime = useCallback(() => +new Date() - oldDate, [oldDate])

  const getLastActiveTime = () => lastActive

  /**
   * The timer instance
   * @type {Timeout}
   * @private
   */
  const tId = useRef()

  // Debounce and throttle cant both be set
  useEffect(() => {
    if (debounce > 0 && throttle > 0) {
      throw new Error(
        'onAction can either be throttled or debounced (not both)'
      )
    }
  }, [debounce, throttle])

  // Create debounced action if applicable
  useEffect(() => {
    if (debounce > 0) {
      onAction = debounced(onAction, debounce)
    }
  }, [debounce, onAction])

  // Create throttled action if applicable
  useEffect(() => {
    if (throttle > 0) {
      onAction = throttled(onAction, throttle)
    }
  }, [throttle, onAction])

  /**
   * Called before the component unmounts
   * here we clear the timer and remove
   * all the event listeners
   */
  useEffect(() => clearTimeout(tId.current))

  /**
   * Event handler for supported event types
   * @param  {Object} e event object
   * @private
   */
  const _handleEvent = useCallback((e) => {
    // Fire debounced, throttled or raw onAction callback with event
    // if (debounce > 0) {
    //   debouncedAction(e)
    // } else if (throttle > 0) {
    //   throttledAction(e)
    // } else {
    onAction(e)
    // }
    // Already active, ignore events
    if (remaining) return
    // Mousemove event
    if (e.type === 'mousemove') {
      // If coordinates are same, it didn't move
      if (e.pageX === pageX && e.pageY === pageY) {
        return
      }
      // If coordinates don't exist how could it move
      if (typeof e.pageX === 'undefined' && typeof e.pageY === 'undefined') {
        return
      }
      // Under 200 ms is hard to do
      // continuous activity will bypass this
      //
      // NOTE: Cant seem to simulate this event with pageX and pageY for testing
      // making this block of code unreachable by test suite
      // opened an issue here https://github.com/Rich-Harris/simulant/issues/19
      const elapsed = getElapsedTime()
      if (elapsed < 200) {
        return
      }
    }
    // Clear any existing timeout
    clearTimeout(tId.current)
    tId.current = null
    // Determine last time User was active, as can't rely on setTimeout ticking at the correct interval
    const elapsedTimeSinceLastActive = new Date() - lastActive
    // If the user is idle or last active time is more than timeout, flip the idle state
    if (
      (isIdle && !stopOnIdle) ||
      (!isIdle && elapsedTimeSinceLastActive > timeout)
    ) {
      _toggleIdleState(e)
    }

    // Store when the user was last active
    // and update the mouse coordinates

    setLastActive(+new Date()) // store when user was last active
    setPageX(e.pageX)
    setPageY(e.pageY)

    // If the user is idle and stopOnIdle flag is not set
    // set a new timeout
    if (isIdle) {
      if (!stopOnIdle) {
        tId.current = setTimeout(_toggleIdleState, timeout)
      }
    } else {
      tId.current = setTimeout(_toggleIdleState, timeout)
    }
  },
  [
    _toggleIdleState,
    debounce,
    // debouncedAction,
    getElapsedTime,
    isIdle,
    lastActive,
    onAction,
    pageX,
    pageY,
    remaining,
    stopOnIdle,
    throttle,
    // throttledAction,
    timeout
  ])

  /**
   * Binds the specified events
   * @private
   */
  const _bindEvents = useCallback(() => {
    // Dont bind events if
    // we are not in a browser
    if (!IS_BROWSER) return

    // Otherwise we bind all the events
    // to the supplied element
    if (!eventsBound) {
      events.forEach((e) => {
        element.addEventListener(e, _handleEvent, {
          capture,
          passive
        })
      })
      setEventsBound(true)
    }
  }, [eventsBound, capture, passive, _handleEvent, events, element])

  /**
   * Unbinds all the bound events
   * @private
   */
  const _unbindEvents = useCallback((force = false) => {
    // If we are not in a browser
    // we don't need to unbind events
    if (!IS_BROWSER) return

    // Unbind all events
    if (eventsBound || force) {
      events.forEach((e) => {
        element.removeEventListener(e, _handleEvent, {
          capture,
          passive
        })
      })
      setEventsBound(false)
    }
  },
  [eventsBound, capture, passive, events, element, _handleEvent])

  /**
 * Toggles the idle state and calls
 * the correct action function
 * @private
 */
  const _toggleIdleState = useCallback((e) => {
    // Fire the appropriate action
    // and pass the event through

    // Toggle the idle state
    setIsIdle((prev) => !prev)

    if (!isIdle) {
      if (!stopOnIdle) {
        _bindEvents()
        onActive(e)
      }
    } else {
      if (stopOnIdle) {
        // Clear any existing timeout
        clearTimeout(tId.current)
        tId.current = null
        // Unbind events
        _unbindEvents()
      }
      onIdle(e)
    }
  },
  [
    setIsIdle,
    isIdle,
    stopOnIdle,
    _bindEvents,
    onActive,
    tId,
    _unbindEvents,
    onIdle
  ])

  /**
   * Restore initial state and restart timer
   * @name reset
   */
  const reset = useCallback(() => {
    // Clear timeout
    clearTimeout(tId.current)
    tId.current = null

    // Bind the events
    _bindEvents()

    // Reset state
    setIsIdle(false)
    setOldDate(+new Date())
    setLastActive(+new Date())
    setRemaining(null)

    // Set new timeout
    tId.current = setTimeout(_toggleIdleState, timeout)
  }, [
    tId,
    _bindEvents,
    setIsIdle,
    setOldDate,
    setLastActive,
    setRemaining,
    _toggleIdleState,
    timeout
  ])

  // If startOnMount is set, idle state defaults to true
  useEffect(() => {
    if (startOnMount) {
      reset()
      return
    }
    setIsIdle(true)
  }, [startOnMount, reset])

  // Set the bound events lifecycle
  useEffect(() => {
    _bindEvents()
    // return _unbindEvents()
  }, [_bindEvents, _unbindEvents])

  return {
    isIdle,
    pause,
    reset,
    resume,
    getLastActiveTime,
    getElapsedTime,
    getRemainingTime
  }
}

/**
 * Type checks for every property
 * @type {Object}
 * @private
 */
useIdleTimer.propTypes = {
  config: PropTypes.shape({
    /**
     * Activity Timeout in milliseconds
     * default: 1200000
     * @type {Number}
     */
    timeout: PropTypes.number,
    /**
     * DOM events to listen to
     * default: see [default events](https://github.com/SupremeTechnopriest/react-idle-timer#default-events)
     * @type {Array}
     */
    events: PropTypes.arrayOf(PropTypes.string),
    /**
     * Function to call when user is idle
     * default: () => {}
     * @type {Function}
     */
    onIdle: PropTypes.func,
    /**
     * Function to call when user becomes active
     * default: () => {}
     * @type {Function}
     */
    onActive: PropTypes.func,
    /**
     * Function to call on user actions
     * default: () => {}
     * @type {Function}
     */
    onAction: PropTypes.func,
    /**
     * Debounce the onAction function by setting delay in milliseconds
     * default: 0
     * @type {Number}
     */
    debounce: PropTypes.number,
    /**
     * Throttle the onAction function by setting delay in milliseconds
     * default: 0
     * @type {Number}
     */
    throttle: PropTypes.number,
    /**
     * Element reference to bind activity listeners to
     * default: document
     * @type {Object}
     */
    element: PropTypes.oneOfType([PropTypes.object, PropTypes.element]),
    /**
     * Start the timer on mount
     * default: true
     * @type {Boolean}
     */
    startOnMount: PropTypes.bool,
    /**
     * Once the user goes idle the useIdleTimer will not
     * reset on user input instead, reset() must be
     * called manually to restart the timer
     * default: false
     * @type {Boolean}
     */
    stopOnIdle: PropTypes.bool,
    /**
     * Bind events passively
     * default: true
     * @type {Boolean}
     */
    passive: PropTypes.bool,
    /**
     * Capture events
     * default: true
     * @type {Boolean}
     */
    capture: PropTypes.bool
  })
}
