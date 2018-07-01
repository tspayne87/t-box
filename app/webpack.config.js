const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const bundleOutputDir = './dist/';

module.exports = {
    context: __dirname,
    devtool: 'source-map',
    mode: 'development',
    resolve: {
        extensions: [ '.ts', '.js', '.vue' ],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    entry: {
        'client': [ './src/client.ts' ]
    },
    module: {
        rules: [
            { test: /\.ts$/, include: /src/, loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } },
            { test: /\.pug$/, include: /src/, loader: 'pug-plain-loader' },
            { test: /\.vue$/, include: /src/, loader: 'vue-loader', options: { template: { doctype: 'html' } } }
        ]
    },
    output: {
        path: path.join(__dirname, bundleOutputDir),
        filename: '[name].js',
        publicPath: 'dist/'
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        }),
        // new webpack.DllReferencePlugin({
        //     content: __dirname,
        //     manifest: require('./dist/vendor-manifest.json')
        // }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map',
            moduleFilenameTemplate: bundleOutputDir
        }),
        new ForkTsCheckerWebpackPlugin({ tslint: true, vue: true, watch: ['./src'] })
    ]
};