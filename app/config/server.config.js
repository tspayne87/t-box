const path = require('path');
const webpack = require('webpack');
const bundleOutputDir = './dist/';

module.exports = {
    context: __dirname,
    target: 'node',
    devtool: 'source-map',
    module: {
        rules: [
            { enforce: 'pre', test: /\.ts$/, include: /src/, loader: 'tslint-loader', options: { configFile: 'tslint.json' } },
            { test: /\.ts$/, include: /src/, loader: 'ts-loader' }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.vue' ]
    },
    entry: {
        'server': [ './src/server.ts' ]
    },
    output: {
        path: path.join(__dirname, bundleOutputDir),
        filename: '[name].js'
    },
    plugins: [
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
};