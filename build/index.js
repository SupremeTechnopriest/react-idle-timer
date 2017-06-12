'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _format = require('date-fns/format');

var _format2 = _interopRequireDefault(_format);

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

  function IdleTimer() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, IdleTimer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(IdleTimer)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
      idle: false,
      oldDate: +new Date(),
      lastActive: +new Date(),
      remaining: null,
      tId: null,
      pageX: null,
      pageY: null
    }, _this._toggleIdleState = function () {
      // Set the state
      _this.setState({
        idle: !_this.state.idle
      });

      // Fire the appropriate action
      if (!_this.state.idle) _this.props.activeAction();else _this.props.idleAction();
    }, _this._handleEvent = function (e) {

      // Already idle, ignore events
      if (_this.state.remaining) return;

      // Mousemove event
      if (e.type === 'mousemove') {
        // if coord are same, it didn't move
        if (e.pageX === _this.state.pageX && e.pageY === _this.state.pageY) return;
        // if coord don't exist how could it move
        if (typeof e.pageX === 'undefined' && typeof e.pageY === 'undefined') return;
        // under 200 ms is hard to do, and you would have to stop, as continuous activity will bypass this
        var elapsed = +new Date() - _this.state.oldDate;
        if (elapsed < 200) return;
      }

      // clear any existing timeout
      clearTimeout(_this.state.tId

      // if the idle timer is enabled, flip
      );if (_this.state.idle) _this._toggleIdleState(e);

      _this.setState({
        lastActive: +new Date(), // store when user was last active
        pageX: e.pageX, // update mouse coord
        pageY: e.pageY,
        tId: setTimeout(_this._toggleIdleState, _this.props.timeout // set a new timeout
        ) });
    }, _this.reset = function () {
      // reset timers
      clearTimeout(_this.state.tId);

      // reset settings
      _this.setState({
        idle: false,
        oldDate: +new Date(),
        lastActive: _this.state.oldDate,
        remaining: null,
        tId: setTimeout(_this._toggleIdleState, _this.props.timeout)
      });
    }, _this.pause = function () {
      // this is already paused
      if (_this.state.remaining !== null) return;

      // clear any existing timeout
      clearTimeout(_this.state.tId

      // define how much is left on the timer
      );_this.setState({
        remaining: _this.props.timeout - (+new Date() - _this.state.oldDate)
      });
    }, _this.resume = function () {
      // this isn't paused yet
      if (_this.state.remaining === null) return;

      // start timer and clear remaining
      if (!_this.state.idle) {
        _this.setState({
          tId: setTimeout(_this._toggleIdleState, _this.state.remaining),
          remaining: null
        });
      }
    }, _this.getRemainingTime = function () {
      // If idle there is no time remaining
      if (_this.state.idle) return 0;

      // If its paused just return that
      if (_this.state.remaining != null) return _this.state.remaining;

      // Determine remaining, if negative idle didn't finish flipping, just return 0
      var remaining = _this.props.timeout - (+new Date() - _this.state.lastActive);
      if (remaining < 0) remaining = 0;

      // If this is paused return that number, else return current remaining
      return remaining;
    }, _this.getElapsedTime = function () {
      return +new Date() - _this.state.oldDate;
    }, _this.getLastActiveTime = function () {
      if (_this.props.format) return (0, _format2.default)(_this.state.lastActive, _this.props.format);
      return _this.state.lastActive;
    }, _this.isIdle = function () {
      return _this.state.idle;
    }, _temp), _possibleConstructorReturn(_this, _ret);
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

    /**
     * Event handler for supported event types
     *
     * @param  {Object} e event object
     * @return {void}
     *
     */


    ////////////////
    // Public API //
    ////////////////

    /**
     * Restore initial settings and restart timer
     *
     * @return {Void}
     *
     */

    /**
     * Store remaining time and stop timer.
     * You can pause from idle or active state.
     *
     * @return {Void}
     *
     */


    /**
     * Resumes a stopped timer
     *
     * @return {Void}
     *
     */


    /**
     * Time remaining before idle
     *
     * @return {Number} Milliseconds remaining
     *
     */


    /**
     * How much time has elapsed
     *
     * @return {Timestamp}
     *
     */


    /**
     * Last time the user was active
     *
     * @return {Timestamp}
     *
     */


    /**
     * Is the user idle
     *
     * @return {Boolean}
     *
     */

  }]);

  return IdleTimer;
}(_react.Component);

IdleTimer.propTypes = {
  timeout: _propTypes2.default.number, // Activity timeout
  events: _propTypes2.default.arrayOf(_propTypes2.default.string), // Activity events to bind
  idleAction: _propTypes2.default.func, // Action to call when user becomes inactive
  activeAction: _propTypes2.default.func, // Action to call when user becomes active
  element: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.string]), // Element ref to watch activty on
  format: _propTypes2.default.string,
  startOnLoad: _propTypes2.default.bool
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