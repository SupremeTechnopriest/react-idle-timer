'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('../build/index');

var _index2 = _interopRequireDefault(_index);

var _format = require('date-fns/format');

var _format2 = _interopRequireDefault(_format);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_Component) {
  _inherits(App, _Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this._onActive = function () {
      _this.setState({ isIdle: false });
    };

    _this._onIdle = function () {
      _this.setState({ isIdle: true });
    };

    _this._changeTimeout = function () {
      _this.setState({
        timeout: _this.refs.timeoutInput.state.value()
      });
    };

    _this._reset = function () {
      _this.refs.idleTimer.reset();
    };

    _this._pause = function () {
      _this.refs.idleTimer.pause();
    };

    _this._resume = function () {
      _this.refs.idleTimer.resume();
    };

    _this.state = {
      timeout: 3000,
      remaining: null,
      isIdle: false,
      lastActive: null,
      elapsed: null
    };
    return _this;
  }

  _createClass(App, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.setState({
        remaining: this.refs.idleTimer.getRemainingTime(),
        lastActive: this.refs.idleTimer.getLastActiveTime(),
        elapsed: this.refs.idleTimer.getElapsedTime()
      });

      setInterval(function () {
        _this2.setState({
          remaining: _this2.refs.idleTimer.getRemainingTime(),
          lastActive: _this2.refs.idleTimer.getLastActiveTime(),
          elapsed: _this2.refs.idleTimer.getElapsedTime()
        });
      }, 1000);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _index2.default,
        {
          ref: 'idleTimer',
          activeAction: this._onActive,
          idleAction: this._onIdle,
          timeout: this.state.timeout,
          startOnLoad: true },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'h1',
              null,
              'Timeout: ',
              this.state.timeout,
              'ms'
            ),
            _react2.default.createElement(
              'h1',
              null,
              'Time Remaining: ',
              this.state.remaining
            ),
            _react2.default.createElement(
              'h1',
              null,
              'Time Elapsed: ',
              this.state.elapsed
            ),
            _react2.default.createElement(
              'h1',
              null,
              'Last Active: ',
              (0, _format2.default)(this.state.lastActive, 'MM-DD-YYYY HH:MM:ss.SSS')
            ),
            _react2.default.createElement(
              'h1',
              null,
              'Idle: ',
              this.state.isIdle.toString()
            )
          ),
          _react2.default.createElement(_index2.default, null),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'button',
              { onClick: this._reset },
              'RESET'
            ),
            _react2.default.createElement(
              'button',
              { onClick: this._pause },
              'PAUSE'
            ),
            _react2.default.createElement(
              'button',
              { onClick: this._resume },
              'RESUME'
            )
          )
        )
      );
    }
  }]);

  return App;
}(_react.Component);

exports.default = App;