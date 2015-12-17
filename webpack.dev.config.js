/**
 * Webpack Dev Config
 * react-hot-loader and babel
 *
 * @author  Randy Lebeau
 *
 */

var path = require('path');
var webpack = require('webpack');

function getJsxLoader() {
  return  { test: /\.jsx?$/
          , loader: 'babel'
          , exclude: /node_modules/
          , include: [path.join(__dirname, 'examples'), path.join(__dirname, 'src')]
          }
}

module.exports = {
    devtool: 'eval',
    watch: true,
    cache: true,
    entry: [ 'webpack-hot-middleware/client', './examples/init' ],
    resolve: {
        extensions: ['', '.jsx', '.js']
    },
    output: {
        path: path.join(__dirname, 'examples'),
        filename: 'script.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [ getJsxLoader() ]
    }
}
