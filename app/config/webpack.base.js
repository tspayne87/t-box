const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    module: {
        rules: [
            // { enforce: 'pre', test: /\.ts$/, loader: 'tslint-loader', include: /src/, options: { configFile: 'tslint.json' } },
            { test: /\.ts$/, include: /src/, loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } },
            { test: /\.pug$/, include: /src/, loader: 'pug-plain-loader' },
            { test: /\.vue$/, include: /src/, loader: 'vue-loader', options: { template: { doctype: 'html' } } }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.vue' ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};