'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash.bindall');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * React Idle Timer
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author  Randy Lebeau
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @class   IdleTimer
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var IdleTimer = function (_Component) {
  _inherits(IdleTimer, _Component);

  function IdleTimer(props) {
    _classCallCheck(this, IdleTimer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IdleTimer).call(this, props));

    _this.state = {
      idle: false,
      oldDate: +new Date(),
      lastActive: +new Date(),
      remaining: null,
      tId: null,
      pageX: null,
      pageY: null
    };

    (0, _lodash2.default)(_this, ['_toggleIdleState', '_handleEvent', 'reset', 'pause', 'resume', 'getRemainingTime', 'getElapsedTime', 'getLastActiveTime', 'isIdle']);

    return _this;
  }

  _createClass(IdleTimer, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      this.props.events.forEach(function (e) {
        return _this2.props.element.addEventListener(e, _this2._handleEvent);
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.startOnLoad) this.reset();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var _this3 = this;

      // Clear timeout to prevent delayed state changes
      clearTimeout(this.state.tId);
      // Unbind all events
      this.props.events.forEach(function (e) {
        return _this3.props.element.removeEventListener(e, _this3._handleEvent);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children ? this.props.children : null;
    }

    /////////////////////
    // Private Methods //
    /////////////////////

    /**
     * Toggles the idle state and calls the proper action
     *
     * @return {void}
     *
     */

  }, {
    key: '_toggleIdleState',
    value: function _toggleIdleState() {
      // Set the state
      this.setState({
        idle: !this.state.idle
      });

      // Fire the appropriate action
      if (!this.state.idle) this.props.activeAction();else this.props.idleAction();
    }

    /**
     * Event handler for supported event types
     *
     * @param  {Object} e event object
     * @return {void}
     *
     */

  }, {
    key: '_handleEvent',
    value: function _handleEvent(e) {

      // Already idle, ignore events
      if (this.state.remaining) return;

      // Mousemove event
      if (e.type === 'mousemove') {
        // if coord are same, it didn't move
        if (e.pageX === this.state.pageX && e.pageY === this.state.pageY) return;
        // if coord don't exist how could it move
        if (typeof e.pageX === 'undefined' && typeof e.pageY === 'undefined') return;
        // under 200 ms is hard to do, and you would have to stop, as continuous activity will bypass this
        var elapsed = +new Date() - this.state.oldDate;
        if (elapsed < 200) return;
      }

      // clear any existing timeout
      clearTimeout(this.state.tId);

      // if the idle timer is enabled, flip
      if (this.state.idle) this._toggleIdleState(e);

      this.setState({
        lastActive: +new Date() // store when user was last active

        , pageX: e.pageX // update mouse coord

        , pageY: e.pageY,
        tId: setTimeout(this._toggleIdleState, this.props.timeout) // set a new timeout
      });
    }

    ////////////////
    // Public API //
    ////////////////

    /**
     * Restore initial settings and restart timer
     *
     * @return {Void}
     *
     */

  }, {
    key: 'reset',
    value: function reset() {
      // reset timers
      clearTimeout(this.state.tId);

      // reset settings
      this.setState({
        idle: false,
        oldDate: +new Date(),
        lastActive: this.state.oldDate,
        remaining: null,
        tId: setTimeout(this._toggleIdleState, this.props.timeout)
      });
    }

    /**
     * Store remaining time and stop timer.
     * You can pause from idle or active state.
     *
     * @return {Void}
     *
     */

  }, {
    key: 'pause',
    value: function pause() {
      // this is already paused
      if (this.state.remaining !== null) return;

      // clear any existing timeout
      clearTimeout(this.state.tId);

      // define how much is left on the timer
      this.setState({
        remaining: this.props.timeout - (+new Date() - this.state.oldDate)
      });
    }

    /**
     * Resumes a stopped timer
     *
     * @return {Void}
     *
     */

  }, {
    key: 'resume',
    value: function resume() {
      // this isn't paused yet
      if (this.state.remaining === null) return;

      // start timer and clear remaining
      if (!this.state.idle) {
        this.setState({
          tId: setTimeout(this._toggleIdleState, this.state.remaining),
          remaining: null
        });
      }
    }

    /**
     * Time remaining before idle
     *
     * @return {Number} Milliseconds remaining
     *
     */

  }, {
    key: 'getRemainingTime',
    value: function getRemainingTime() {
      // If idle there is no time remaining
      if (this.state.idle) return 0;

      // If its paused just return that
      if (this.state.remaining != null) return this.state.remaining;

      // Determine remaining, if negative idle didn't finish flipping, just return 0
      var remaining = this.props.timeout - (+new Date() - this.state.lastActive);
      if (remaining < 0) remaining = 0;

      // If this is paused return that number, else return current remaining
      return remaining;
    }

    /**
     * How much time has elapsed
     *
     * @return {Timestamp}
     *
     */

  }, {
    key: 'getElapsedTime',
    value: function getElapsedTime() {
      return +new Date() - this.state.oldDate;
    }

    /**
     * Last time the user was active
     *
     * @return {Timestamp}
     *
     */

  }, {
    key: 'getLastActiveTime',
    value: function getLastActiveTime() {
      if (this.props.format) return (0, _moment2.default)(this.state.lastActive).format(this.props.format);
      return this.state.lastActive;
    }

    /**
     * Is the user idle
     *
     * @return {Boolean}
     *
     */

  }, {
    key: 'isIdle',
    value: function isIdle() {
      return this.state.idle;
    }
  }]);

  return IdleTimer;
}(_react.Component);

IdleTimer.propTypes = {
  timeout: _react.PropTypes.number, // Activity timeout
  events: _react.PropTypes.arrayOf(_react.PropTypes.string), // Activity events to bind
  idleAction: _react.PropTypes.func, // Action to call when user becomes inactive
  activeAction: _react.PropTypes.func, // Action to call when user becomes active
  element: _react.PropTypes.oneOfType([_react.PropTypes.object, _react.PropTypes.string]), // Element ref to watch activty on
  format: _react.PropTypes.string,
  startOnLoad: _react.PropTypes.bool
};
IdleTimer.defaultProps = {
  timeout: 1000 * 60 * 20, // 20 minutes
  events: ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'MSPointerDown', 'MSPointerMove'],
  idleAction: function idleAction() {},
  activeAction: function activeAction() {},
  element: document,
  startOnLoad: true
};
exports.default = IdleTimer;