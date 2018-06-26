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

const IS_BROWSER = (typeof window === 'undefined' ? 'undefined' : typeof (window)) === 'object'

/**
 * Default element to listen for events on
 * @type {[type]}
 */
const DEFAULT_ELEMENT = IS_BROWSER ? document : {}

/**
 * The default events to determine activity
 * @type {Array}
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
 */
export default class IdleTimer extends Component {
  /**
   * Type checks for every property
   * @type {Object}
   * @private
   */
  static propTypes = {
    /**
     * Activity Timeout
     * @type {Number}
     */
    timeout: PropTypes.number,
    /**
     * Activty events to listen on
     * @type {Array}
     */
    events: PropTypes.arrayOf(PropTypes.string),
    /**
     * Function to call when user is idle
     * @type {Function}
     */
    idleAction: PropTypes.func,
    /**
     * Function to call when user becomes active
     * @type {Function}
     */
    activeAction: PropTypes.func,
    /**
     * Element reference to bind activity listeners to
     * @type {Object}
     */
    element: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    /**
     * Start the timer on mount
     * @type {Boolean}
     */
    startOnMount: PropTypes.bool
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
    idleAction: () => {},
    activeAction: () => {},
    startOnMount: true
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
   */
  tId = null

  /**
   * Creates an instance of IdleTimer
   * bind all of our internal events here
   * for best performance
   * @param {Object} props
   * @return {IdleTimer}
   */
  constructor (props) {
    super(props)
    this.toggleIdleState = this._toggleIdleState.bind(this)
    this.reset = this._reset.bind(this)
    this.pause = this._pause.bind(this)
    this.resume = this._resume.bind(this)
    this.getRemainingTime = this._getRemainingTime.bind(this)
    this.getElapsedTime = this._getElapsedTime.bind(this)
    this.getLastActiveTime = this._getLastActiveTime.bind(this)
    this.isIdle = this._isIdle.bind(this)
  }

  /**
   * Runs when the component mounts
   * here we bind the events to the
   * element we want to listen on
   * @private
   */
  componentWillMount () {
    // Dont bind events if
    // we are not in a browser
    if (!IS_BROWSER) return
    // Otherwise we bind all the events
    // to the supplied element
    const { element, events } = this.props
    events.forEach(e => element.addEventListener(e, this._handleEvent), {
      capture: true,
      passive: true
    })
  }

  /**
   * Runs once the component has mounted
   * here we handle automatically starting
   * the idletimer
   * @private
   */
  componentDidMount () {
    // If startOnMount is enabled
    // start the timer
    const { startOnMount } = this.props
    if (startOnMount) {
      this.reset()
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
    // If we are not in a browser
    // we dont need to unbind events
    if (!IS_BROWSER) return
    // Unbind all events
    const { element, events } = this.props
    events.forEach(e => element.removeEventListener(e, this._handleEvent))
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
   * Toggles the idle state and calls
   * the correct action function
   * @private
   */
  _toggleIdleState () {
    // Toggle the idle state
    const { idle } = this.state
    this.setState({
      idle: !idle
    })

    // Fire the appropriate action
    const { activeAction, idleAction } = this.props
    if (idle) {
      activeAction()
    } else {
      idleAction()
    }
  }

  /**
   * Event handler for supported event types
   * @param  {Object} e event object
   * @private
   */
  _handleEvent = (e) => {
    const { remaining, pageX, pageY } = this.state
    // Already idle, ignore events
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
      const elapsed = this.getElapsedTime()
      if (elapsed < 200) {
        return
      }
    }

    // Clear any existing timeout
    clearTimeout(this.tId)

    // If the idle timer is enabled, flip
    if (this.state.idle) {
      this._toggleIdleState(e)
    }

    // Store when the user was last active
    // and update the mouse coordinates
    this.setState({
      lastActive: +new Date(), // store when user was last active
      pageX: e.pageX, // update mouse coord
      pageY: e.pageY
    })

    // Set a new timeout
    const { timeout } = this.props
    this.tId = setTimeout(this._toggleIdleState.bind(this), timeout) // set a new timeout
  }

  /**
   * Restore initial state and restart timer
   */
  _reset () {
    // Clear timeout
    clearTimeout(this.tId)

    // Reset state
    this.setState({
      idle: false,
      oldDate: +new Date(),
      lastActive: this.state.oldDate,
      remaining: null
    })

    // Set new timeout
    const { timeout } = this.props
    this.tId = setTimeout(this._toggleIdleState.bind(this), timeout)
  }

  /**
   * Store remaining time and stop timer
   */
  _pause () {
    // Timer is already paused
    const { remaining } = this.state
    if (remaining !== null) {
      return
    }

    // Clear existing timeout
    clearTimeout(this.tId)

    // Define how much is left on the timer
    this.setState({
      remaining: this.getRemainingTime()
    })
  }

  /**
   * Resumes a paused timer
   */
  _resume () {
    // Timer is not paused
    const { remaining, idle } = this.state
    if (remaining === null) {
      return
    }

    // Start timer and clear remaining
    // if we are in the idle state
    if (!idle) {
      this.setState({ remaining: null })
      // Set a new timeout
      this.tId = setTimeout(this._toggleIdleState.bind(this), remaining)
    }
  }

  /**
   * Time remaining before idle
   * @return {Number} Milliseconds remaining
   */
  _getRemainingTime () {
    const { remaining, idle, lastActive } = this.state
    // If idle there is no time remaining
    if (idle) {
      return 0
    }

    // If timer is in a paused state
    // just return its remaining time
    if (remaining !== null) {
      return remaining
    }

    // Determine remaining, if negative idle didn't finish flipping, just return 0
    const { timeout } = this.props
    let timeLeft = timeout - ((+new Date()) - lastActive)
    if (timeLeft < 0) {
      timeLeft = 0
    }
    return timeLeft
  }

  /**
   * How much time has elapsed
   * @return {Timestamp}
   */
  _getElapsedTime () {
    const { oldDate } = this.state
    return (+new Date()) - oldDate
  }

  /**
   * Last time the user was active
   * @return {Timestamp}
   */
  _getLastActiveTime () {
    const { lastActive } = this.state
    return lastActive
  }

  /**
   * Returns wether or not the user is idle
   * @return {Boolean}
   */
  _isIdle () {
    const { idle } = this.state
    return idle
  }
}
