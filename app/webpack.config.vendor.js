const path = require('path');
const webpack = require('webpack');

module.exports = {
    resolve: { extensions: [ '.js' ] },
    entry: {
        vendor: [
            'event-source-polyfill',
            'axios',
            'vue',
            'vuex',
            'vue-router'
        ]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: 'dist/',
        filename: '[name].js',
        library: '[name]_[hash]'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        }),
        new webpack.DllPlugin({
            context: __dirname,
            path: path.join(__dirname, 'dist', '[name]-manifest.json'),
            name: '[name]_[hash]'
        })
    ]
};