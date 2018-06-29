const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const bundleOutputDir = './dist/';

module.exports = merge(require('./webpack.base'), {
    devtool: 'source-map',
    plugins: [
        new CheckerPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: 'development'
            }
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map',
            moduleFilenameTemplate: bundleOutputDir
        })
    ]
});