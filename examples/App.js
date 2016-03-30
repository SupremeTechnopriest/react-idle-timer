'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformHmr3 = require('react-transform-hmr');

var _reactTransformHmr4 = _interopRequireDefault(_reactTransformHmr3);

var _index = require('../build/index');

var _index2 = _interopRequireDefault(_index);

var _lodash = require('lodash.bindall');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  App: {
    displayName: 'App'
  }
};

var _reactTransformHmr2 = (0, _reactTransformHmr4.default)({
  filename: 'src_examples/App.js',
  components: _components,
  locals: [module],
  imports: [_react3.default]
});

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'src_examples/App.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformHmr2(_reactTransformCatchErrors2(Component, id), id);
  };
}

var App = _wrapComponent('App')(function (_Component) {
  _inherits(App, _Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

    _this.state = {
      timeout: 3000,
      remaining: null,
      isIdle: false,
      lastActive: null,
      elapsed: null
    };
    (0, _lodash2.default)(_this, ['_onActive', '_onIdle', '_changeTimeout', '_reset', '_pause', '_resume']);
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
      return _react3.default.createElement(
        _index2.default,
        {
          ref: 'idleTimer',
          activeAction: this._onActive,
          idleAction: this._onIdle,
          timeout: this.state.timeout,
          startOnLoad: true,
          format: 'MM-DD-YYYY HH:MM:ss.SSS' },
        _react3.default.createElement(
          'div',
          null,
          _react3.default.createElement(
            'div',
            null,
            _react3.default.createElement(
              'h1',
              null,
              'Timeout: ',
              this.state.timeout,
              'ms'
            ),
            _react3.default.createElement(
              'h1',
              null,
              'Time Remaining: ',
              this.state.remaining
            ),
            _react3.default.createElement(
              'h1',
              null,
              'Time Elapsed: ',
              this.state.elapsed
            ),
            _react3.default.createElement(
              'h1',
              null,
              'Last Active: ',
              this.state.lastActive
            ),
            _react3.default.createElement(
              'h1',
              null,
              'Idle: ',
              this.state.isIdle.toString()
            )
          ),
          _react3.default.createElement(_index2.default, null),
          _react3.default.createElement(
            'div',
            null,
            _react3.default.createElement(
              'button',
              { onClick: this._reset },
              'RESET'
            ),
            _react3.default.createElement(
              'button',
              { onClick: this._pause },
              'PAUSE'
            ),
            _react3.default.createElement(
              'button',
              { onClick: this._resume },
              'RESUME'
            )
          )
        )
      );
    }
  }, {
    key: '_onActive',
    value: function _onActive() {
      this.setState({ isIdle: false });
    }
  }, {
    key: '_onIdle',
    value: function _onIdle() {
      this.setState({ isIdle: true });
    }
  }, {
    key: '_changeTimeout',
    value: function _changeTimeout() {
      this.setState({
        timeout: this.refs.timeoutInput.state.value()
      });
    }
  }, {
    key: '_reset',
    value: function _reset() {
      this.refs.idleTimer.reset();
    }
  }, {
    key: '_pause',
    value: function _pause() {
      this.refs.idleTimer.pause();
    }
  }, {
    key: '_resume',
    value: function _resume() {
      this.refs.idleTimer.resume();
    }
  }]);

  return App;
}(_react2.Component));

exports.default = App;