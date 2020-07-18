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
import { IS_BROWSER, DEFAULT_ELEMENT, DEFAULT_EVENTS, debounced, throttled } from './utils'

/**
 * Detects when your user is idle
 * @class IdleTimer
 * @private
 */
class IdleTimer extends Component {
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

    /**
     * Sets initial component state
     * @type {Object}
     * @private
     */
    this.state = {
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
    this.tId = null

    /**
     * Wether or not events are bound
     * @type {boolean}
     * @private
     */
    this.eventsBound = false

    // Debounce and throttle can't both be set
    if (props.debounce > 0 && props.throttle > 0) {
      throw new Error('onAction can either be throttled or debounced (not both)')
    }

    // Create debounced action if applicable
    if (props.debounce > 0) {
      this._onAction = debounced(props.onAction, props.debounce)

    // Create throttled action if applicable
    } else if (props.throttle > 0) {
      this._onAction = throttled(props.onAction, props.throttle)

    // Set custom onAction
    } else if (props.onAction) {
      this._onAction = props.onAction

    // Set default onAction
    } else {
      this._onAction = () => {}
    }

    // Create a throttle event handler if applicable
    if (props.eventsThrottle > 0) {
      this._handleEvent = throttled(this._handleEvent.bind(this), props.eventsThrottle)
    } else {
      this._handleEvent = this._handleEvent.bind(this)
    }

    // If startOnMount is set, idle state defaults to true
    if (!props.startOnMount) {
      this.state.idle = true
    }

    // Bind all events to component scope, built for speed 🚀
    this._toggleIdleState = this._toggleIdleState.bind(this)
    this.reset = this.reset.bind(this)
    this.pause = this.pause.bind(this)
    this.resume = this.resume.bind(this)
    this.getRemainingTime = this.getRemainingTime.bind(this)
    this.getElapsedTime = this.getElapsedTime.bind(this)
    this.getLastActiveTime = this.getLastActiveTime.bind(this)
    this.isIdle = this.isIdle.bind(this)
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
      this._onAction = debounced(this._onAction, this.props.debounce)
    }
    // Update throttle function
    if (prevProps.throttle !== this.props.throttle) {
      this._onAction = throttled(this._onAction, this.props.throttle)
    }
    // Update event throttle function
    if (prevProps.eventsThrottle !== this.props.eventsThrottle) {
      this._handleEvent = throttled(this._handleEvent, this.props.eventsThrottle)
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
    // Don't bind events if
    // we are not in a browser
    if (!IS_BROWSER) return
    // Otherwise we bind all the events
    // to the supplied element
    const { element, events, passive, capture } = this.props
    if (!this.eventsBound) {
      events.forEach(e => {
        element.addEventListener(e, this._handleEvent, {
          capture,
          passive
        })
      })
      this.eventsBound = true
    }
  }

  /**
   * Unbinds all the bound events
   * @private
   */
  _unbindEvents (force = false) {
    // If we are not in a browser
    // we don't need to unbind events
    if (!IS_BROWSER) return
    // Unbind all events
    const { element, events, passive, capture } = this.props
    if (this.eventsBound || force) {
      events.forEach(e => {
        element.removeEventListener(e, this._handleEvent, {
          capture,
          passive
        })
      })
      this.eventsBound = false
    }
  }

  /**
   * Toggles the idle state and calls
   * the correct action function
   * @private
   */
  _toggleIdleState (e) {
    // Fire the appropriate action
    // and pass the event through
    // Toggle the idle state
    this.setState((prevState) => ({
      idle: !prevState.idle
    }), () => {
      const { onActive, onIdle, stopOnIdle } = this.props
      const { idle } = this.state
      if (idle) {
        if (stopOnIdle) {
          // Clear any existing timeout
          clearTimeout(this.tId)
          this.tId = null
          // Unbind events
          this._unbindEvents()
        }
        onIdle(e)
      } else {
        if (!stopOnIdle) {
          this._bindEvents()
          onActive(e)
        }
      }
    })
  }

  /**
   * Event handler for supported event types
   * @param  {Object} e event object
   * @private
   */
  _handleEvent (e) {
    const { remaining, pageX, pageY, idle } = this.state
    const { timeout, stopOnIdle } = this.props

    // Fire onAction event
    this._onAction(e)

    // Already active, ignore events
    if (remaining) return

    // Mousemove event
    if (e.type === 'mousemove') {
      // If coords are same, it didn't move
      if (e.pageX === pageX && e.pageY === pageY) {
        return
      }
      // If coords don't exist how could it move
      if (typeof e.pageX === 'undefined' && typeof e.pageY === 'undefined') {
        return
      }
      // Under 200 ms is hard to do
      // continuous activity will bypass this
      const elapsed = this.getElapsedTime()
      if (elapsed < 200) {
        return
      }
    }

    // Clear any existing timeout
    clearTimeout(this.tId)
    this.tId = null

    // Determine last time User was active, as can't rely on setTimeout ticking at the correct interval
    const elapsedTimeSinceLastActive = +new Date() - this.getLastActiveTime()

    // If the user is idle or last active time is more than timeout, flip the idle state
    if ((idle && !stopOnIdle) || (!idle && elapsedTimeSinceLastActive > timeout)) {
      this._toggleIdleState(e)
    }

    // Store when the user was last active
    // and update the mouse coordinates
    this.setState({
      lastActive: +new Date(),
      pageX: e.pageX,
      pageY: e.pageY
    })

    // If the user is idle and stopOnIdle flag is not set
    // set a new timeout
    if (idle) {
      if (!stopOnIdle) {
        this.tId = setTimeout(this._toggleIdleState, timeout)
      }
    } else {
      this.tId = setTimeout(this._toggleIdleState, timeout)
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
    this.tId = setTimeout(this._toggleIdleState, timeout)
  }

  /**
   * Store remaining time and stop timer
   * @name pause
   */
  pause () {
    // Timer is already paused
    const { remaining } = this.state
    if (remaining !== null) return

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
    if (remaining === null) return

    // Bind events
    this._bindEvents()

    // Start timer and clear remaining
    // if we are in the idle state
    if (!idle) {
      // Set a new timeout
      this.tId = setTimeout(this._toggleIdleState, remaining)
      // Set new state
      this.setState({ remaining: null, lastActive: +new Date() })
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
    const timeLeft = timeout - ((+new Date()) - lastActive)
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
  isIdle () {
    const { idle } = this.state
    return idle
  }
}

/**
 * Type checks for every property
 * @type {Object}
 * @private
 */
IdleTimer.propTypes = {
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
   * Throttle the event handler function by setting delay in milliseconds
   * default: 200
   * @type {Number}
   */
  eventsThrottle: PropTypes.number,
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
IdleTimer.defaultProps = {
  timeout: 1000 * 60 * 20,
  element: DEFAULT_ELEMENT,
  events: DEFAULT_EVENTS,
  onIdle: () => { },
  onActive: () => { },
  onAction: () => { },
  debounce: 0,
  throttle: 0,
  eventsThrottle: 200,
  startOnMount: true,
  stopOnIdle: false,
  capture: true,
  passive: true
}

export default IdleTimer
