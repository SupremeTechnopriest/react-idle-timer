/**
 *  ___    _ _     _____ _
 * |_ _|__| | | __|_   _(_)_ __ ___   ___ _ __
 *  | |/ _` | |/ _ \| | | | '_ ` _ \ / _ \ '__|
 *  | | (_| | |  __/| | | | | | | | |  __/ |
 * |___\__,_|_|\___||_| |_|_| |_| |_|\___|_|
 *
 * @name IdleTimer
 * @author Randy Lebeau
 * @private
 */

import { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * Determine if we are in a browser
 * or a server environment
 * @type {Boolean}
 * @private
 */
const IS_BROWSER = (typeof window === 'undefined' ? 'undefined' : typeof (window)) === 'object'

/**
 * Default element to listen for events on
 * @type {Object}
 * @private
 */
const DEFAULT_ELEMENT = IS_BROWSER ? document : {}

/**
 * The default events to determine activity
 * @type {Array}
 * @private
 */
const DEFAULT_EVENTS = [
  'mousemove',
  'keydown',
  'wheel',
  'DOMMouseScroll',
  'mouseWheel',
  'mousedown',
  'touchstart',
  'touchmove',
  'MSPointerDown',
  'MSPointerMove'
]

/**
 * Detects when your user is idle
 * @class IdleTimer
 * @private
 */
export default class IdleTimer extends Component {
  /**
   * Type checks for every property
   * @type {Object}
   * @private
   */
  static propTypes = {
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
     * Once the user goes idle the IdleTimer will not
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
  }

  /**
   * Sets default property values
   * @type {Object}
   * @private
   */
  static defaultProps = {
    timeout: 1000 * 60 * 20,
    element: DEFAULT_ELEMENT,
    events: DEFAULT_EVENTS,
    onIdle: () => {},
    onActive: () => {},
    onAction: () => {},
    debounce: 0,
    throttle: 0,
    startOnMount: true,
    stopOnIdle: false,
    capture: true,
    passive: true
  }

  /**
   * Sets initial component state
   * @type {Object}
   * @private
   */
  state = {
    idle: false,
    oldDate: +new Date(),
    lastActive: +new Date(),
    remaining: null,
    pageX: null,
    pageY: null
  }

  /**
   * The timer instance
   * @type {Timeout}
   * @private
   */
  tId = null

  /**
   * Creates an instance of IdleTimer
   * bind all of our internal events here
   * for best performance
   * @param {Object} props
   * @return {IdleTimer}
   * @private
   */
  constructor (props) {
    super(props)

    // Debounce and throttle cant both be set
    if (props.debounce > 0 && props.throttle > 0) {
      throw new Error('onAction can either be throttled or debounced (not both)')
    }

    // Create debounced action if applicable
    if (props.debounce > 0) {
      this.debouncedAction = debounced(props.onAction, props.debounce)
    }

    // Create throttled action if applicable
    if (props.throttle > 0) {
      this.throttledAction = throttled(props.onAction, props.throttle)
    }

    // If startOnMount is set, idle state defaults to true
    if (!props.startOnMount) {
      this.state.idle = true
    }

    // Bind all events to component scope, built for speed 🚀
    this.toggleIdleState = this._toggleIdleState.bind(this)
    this.reset = this.reset.bind(this)
    this.pause = this.pause.bind(this)
    this.resume = this.resume.bind(this)
    this.getRemainingTime = this.getRemainingTime.bind(this)
    this.getElapsedTime = this.getElapsedTime.bind(this)
    this.getLastActiveTime = this.getLastActiveTime.bind(this)
    this.isIdle = this._isIdle.bind(this)
  }

  /**
   * Runs once the component has mounted
   * here we handle automatically starting
   * the idletimer
   * @private
   */
  componentDidMount () {
    // Bind the event listeners
    this._bindEvents()
    // If startOnMount is enabled start the timer
    const { startOnMount } = this.props
    if (startOnMount) {
      this.reset()
    }
  }

  componentDidUpdate (prevProps) {
    // Update debounce function
    if (prevProps.debounce !== this.props.debounce) {
      this.debouncedAction = debounced(this.props.onAction, this.props.debounce)
    }
    // Update throttle function
    if (prevProps.throttle !== this.props.throttle) {
      this.throttledAction = throttled(this.props.onAction, this.props.throttle)
    }
  }

  /**
   * Called before the component unmounts
   * here we clear the timer and remove
   * all the event listeners
   * @private
   */
  componentWillUnmount () {
    // Clear timeout to prevent delayed state changes
    clearTimeout(this.tId)
    this._unbindEvents(true)
  }

  /**
   * Render children if IdleTimer is used as a wrapper
   * @return {Component} children
   * @private
   */
  render () {
    const { children } = this.props
    return children || null
  }

  /**
   * Binds the specified events
   * @private
   */
  _bindEvents () {
    // Dont bind events if
    // we are not in a browser
    if (!IS_BROWSER) return
    // Otherwise we bind all the events
    // to the supplied element
    const { eventsBound } = this.state
    const { element, events, passive, capture } = this.props
    if (!eventsBound) {
      events.forEach(e => {
        element.addEventListener(e, this._handleEvent, {
          capture,
          passive
        })
      })
      this.setState({ eventsBound: true })
    }
  }

  /**
   * Unbinds all the bound events
   * @private
   */
  _unbindEvents (force = false) {
    // If we are not in a browser
    // we dont need to unbind events
    if (!IS_BROWSER) return
    // Unbind all events
    const { element, events, passive, capture } = this.props
    const { eventsBound } = this.state
    if (eventsBound || force) {
      events.forEach(e => {
        element.removeEventListener(e, this._handleEvent, {
          capture,
          passive
        })
      })
      this.setState({ eventsBound: false })
    }
  }

  /**
   * Toggles the idle state and calls
   * the correct action function
   * @private
   */
  _toggleIdleState (e) {
    const { idle } = this.state
    // Fire the appropriate action
    // and pass the event through
    const { onActive, onIdle, stopOnIdle } = this.props
    // Toggle the idle state
    this.setState({
      idle: !idle
    }, () => {
      if (idle) {
        if (!stopOnIdle) {
          this._bindEvents()
          onActive(e)
        }
      } else {
        if (stopOnIdle) {
          // Clear any existing timeout
          clearTimeout(this.tId)
          this.tId = null
          // Unbind events
          this._unbindEvents()
        }
        onIdle(e)
      }
    })
  }

  /**
   * Event handler for supported event types
   * @param  {Object} e event object
   * @private
   */
  _handleEvent = (e) => {
    const { remaining, pageX, pageY, idle } = this.state
    const { timeout, onAction, debounce, throttle, stopOnIdle } = this.props

    // Fire debounced, throttled or raw onAction callback with event
    if (debounce > 0) {
      this.debouncedAction(e)
    } else if (throttle > 0) {
      this.throttledAction(e)
    } else {
      onAction(e)
    }

    // Already active, ignore events
    if (remaining) return

    // Mousemove event
    if (e.type === 'mousemove') {
      // If coord are same, it didn't move
      if (e.pageX === pageX && e.pageY === pageY) {
        return
      }
      // If coord don't exist how could it move
      if (typeof e.pageX === 'undefined' && typeof e.pageY === 'undefined') {
        return
      }
      // Under 200 ms is hard to do
      // continuous activity will bypass this
      //
      // TODO: Cant seem to simulate this event with pageX and pageY for testing
      // making this block of code unreachable by test suite
      // opened an issue here https://github.com/Rich-Harris/simulant/issues/19
      const elapsed = this.getElapsedTime()
      if (elapsed < 200) {
        return
      }
    }

    // Clear any existing timeout
    clearTimeout(this.tId)
    this.tId = null

    // If the user is idle flip the idle state
    if (idle && !stopOnIdle) {
      this.toggleIdleState(e)
    }

    // Store when the user was last active
    // and update the mouse coordinates
    this.setState({
      lastActive: +new Date(), // store when user was last active
      pageX: e.pageX, // update mouse coord
      pageY: e.pageY
    })

    // If the user is idle and stopOnIdle flag is not set
    // set a new timeout
    if (idle) {
      if (!stopOnIdle) {
        this.tId = setTimeout(this.toggleIdleState, timeout)
      }
    } else {
      this.tId = setTimeout(this.toggleIdleState, timeout)
    }
  }

  /**
   * Restore initial state and restart timer
   * @name reset
   */
  reset () {
    // Clear timeout
    clearTimeout(this.tId)
    this.tId = null

    // Bind the events
    this._bindEvents()

    // Reset state
    this.setState({
      idle: false,
      oldDate: +new Date(),
      lastActive: +new Date(),
      remaining: null
    })

    // Set new timeout
    const { timeout } = this.props
    this.tId = setTimeout(this.toggleIdleState, timeout)
  }

  /**
   * Store remaining time and stop timer
   * @name pause
   */
  pause () {
    // Timer is already paused
    const { remaining } = this.state
    if (remaining !== null) {
      return
    }

    // Unbind events
    this._unbindEvents()

    // Clear existing timeout
    clearTimeout(this.tId)
    this.tId = null

    // Define how much is left on the timer
    this.setState({
      remaining: this.getRemainingTime()
    })
  }

  /**
   * Resumes a paused timer
   * @name resume
   */
  resume () {
    // Timer is not paused
    const { remaining, idle } = this.state
    if (remaining === null) {
      return
    }

    // Bind events
    this._bindEvents()

    // Start timer and clear remaining
    // if we are in the idle state
    if (!idle) {
      this.setState({ remaining: null, lastActive: +new Date() })
      // Set a new timeout
      this.tId = setTimeout(this.toggleIdleState, remaining)
    }
  }

  /**
   * Time remaining before idle
   * @name getRemainingTime
   * @return {Number} Milliseconds remaining
   */
  getRemainingTime () {
    const { remaining, lastActive } = this.state
    const { timeout } = this.props

    // If idle there is no time remaining
    if (remaining !== null) {
      return remaining < 0 ? 0 : remaining
    }

    // Determine remaining, if negative idle didn't finish flipping, just return 0
    let timeLeft = timeout - ((+new Date()) - lastActive)
    return timeLeft < 0 ? 0 : timeLeft
  }

  /**
   * How much time has elapsed
   * @name getElapsedTime
   * @return {Timestamp}
   */
  getElapsedTime () {
    const { oldDate } = this.state
    return (+new Date()) - oldDate
  }

  /**
   * Last time the user was active
   * @name getLastActiveTime
   * @return {Timestamp}
   */
  getLastActiveTime () {
    const { lastActive } = this.state
    return lastActive
  }

  /**
   * Returns wether or not the user is idle
   * @name isIdle
   * @return {Boolean}
   */
  _isIdle () {
    const { idle } = this.state
    return idle
  }
}

/**
 * Creates a debounced function that delays invoking func until
 * after delay milliseconds has elapsed since the last time the
 * debounced function was invoked.
 * @name debounced
 * @param  {Function} fn   Function to debounce
 * @param  {Number} delay  How long to wait
 * @return {Function}      Executed Function
**/
function debounced (fn, delay) {
  let timerId
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }
}

/**
 * Creates a throttled function that only invokes func at most
 * once per every wait milliseconds.
 * @name throttled
 * @param  {Function} fn   Function to debounce
 * @param  {Number} delay  How long to wait
 * @return {Function}      Executed Function
**/
function throttled (fn, delay) {
  let lastCall = 0
  return function (...args) {
    const now = new Date().getTime()
    if (now - lastCall < delay) {
      return
    }
    lastCall = now
    return fn(...args)
  }
}
