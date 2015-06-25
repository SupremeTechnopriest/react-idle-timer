/**
 * React Idle Timer
 *
 * @author  Randy Lebeau
 * @class 	IdleTimer
 *
 */

import React from 'react/addons';

export default React.createClass({

	/////////////////////
	// React Lifecycle //
	/////////////////////

	displayName: 'IdleTimer',

	propTypes: {
		timeout: React.PropTypes.number, 							// Activity timeout
		events: React.PropTypes.arrayOf(React.PropTypes.string),	// Activity events to bind
		idleAction: React.PropTypes.func, 							// Action to call when user becomes inactive
		activeAction: React.PropTypes.func,							// Action to call when user becomes active
		element: React.PropTypes.string 							// Element ref to watch activty on
	},

	getDefaultProps() {
		return {
			timeout: 1000 * 60 * 20, // 20 minutes
			events: [
				'mousemove',
				'keydown',
				'wheel',
				'DOMMouseScroll',
				'mousewheel',
				'mousedown',
				'touchstart',
				'touchmove',
				'MSPointerDown',
				'MSPointerMove'
			],
			idleAction: function() {},
			activeAction: function() {},
			element: document
		};
	},

	getInitialState() {
		return {
			idle: false,
			oldDate: null,
			lastActive: null,
			remaining: null,
			tId: null,
			pageX: null,
			pageY: null
		};
	},

	componentWillMount() {
		this.props.events.forEach((event) => {
			this.props.element.addEventListener(this._handleEvent);
		});
	},

	componentWillUnmount() {
		this.props.events.forEach((event) => {
			this.props.element.removeEventListener(this._handleEvent);
		});
	},

	render() { return this.props.children; },

	/////////////////////
	// Private Methods //
	/////////////////////

	timeout: null,

	/**
	 * Toggles the idle state and calls the proper action
	 *
	 * @return {void}
	 *
	 */

	_toggleIdleState() {

		// Fire the appropriate action
		if(this.state.idle) {
			this.props.activeAction();
		} else {
			this.props.idleAction();
		}

		// Set the state
		this.setState({ idle: !this.state.idle });

	},

	_handleEvent(e) {

		// Already idle, ignore events
		if(this.state.remaining) return;

		// Mousemove event
		console.log(e);


	},

	////////////////
	// Public API //
	////////////////

	destroy() {},

	pause() {},

	resume() {},

	reset() {},

	getRemainingTime() {},

	getElapsedTime() {},

	getLastActiveTime() {},

	isIdle() {}

});
