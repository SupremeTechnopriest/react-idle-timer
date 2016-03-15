'use strict';

var _path = require('path');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _webpackDev = require('../webpack.dev.config');

var _webpackDev2 = _interopRequireDefault(_webpackDev);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var compiler = (0, _webpack2.default)(_webpackDev2.default);

app.use((0, _webpackDevMiddleware2.default)(compiler, {
	noInfo: true,
	publicPath: _webpackDev2.default.output.publicPath
}));

app.use((0, _webpackHotMiddleware2.default)(compiler));
app.get('*', function (req, res) {
	return res.sendFile((0, _path.join)(__dirname, 'index.html'));
});

app.listen(3000, 'localhost', function (err) {
	if (err) return console.log(err);
	console.log('Listening at http://localhost:3000');
});