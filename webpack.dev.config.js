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
    devtool: 'source-map',
    watch: true,
    cache: false,
    entry: [
        'webpack-dev-server/client?http://localhost:3002',
        'webpack/hot/only-dev-server',
        './examples/Init'
    ],
    resolve: {
        extensions: ['', '.jsx', '.js']
    },
    output: {
        path: path.join(__dirname, 'examples'),
        filename: 'script.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loaders: ['react-hot', 'babel-loader?optional=runtime'],
            exclude: /node_modules/,
            include: [path.join(__dirname, 'examples'), path.join(__dirname, 'src')]
        }]
    }
};
