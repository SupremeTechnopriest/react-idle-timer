/**
 * Webpack Dev Config
 * react-hot-loader and babel
 *
 * @author  Randy Lebeau
 *
 */

var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: 'eval',
    entry: [
        './src/index'
    ],
    resolve: {
        extensions: ['', '.jsx', '.js'],
        modulesDirectories: ['node_modules']
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'index.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ],
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loaders: ['babel-loader?optional=runtime'],
            exclude: /node_modules/,
            include: [path.join(__dirname, 'src')]
        }]
    }
};
