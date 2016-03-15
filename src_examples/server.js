import { join } from 'path'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../webpack.dev.config'

const app = express();
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
	noInfo: true,
	publicPath: config.output.publicPath
}));

app.use(webpackHotMiddleware(compiler))
app.get('*', (req, res) => res.sendFile(join(__dirname, 'index.html')))

app.listen(3000, 'localhost', err => {
	if (err) return console.log(err);
	console.log('Listening at http://localhost:3000')
});