const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const { execa } = require('@vue/cli-shared-utils');

module.exports = (api, options) => {
  if (api.hasPlugin('typescript') && api.hasPlugin('router')) {
    api.registerCommand(
      'tbox:serve',
      {
        description: 'Run the T-Box server and watch the sources to restart automatically',
        usage: 'vue-cli-service tbox:serve'
      },
      args => {
        const tboxConfig = require(path.resolve(api.getCwd(), 'tbox.json'));
        const externals = [ nodeExternals({ whitelist: [ 'webpack/hot/poll?1000' ] }) ];

        // Set-up definitions from the node enviornment
        let definitions = { 'process.env.NODE_ENV': '"development"' };
        const keys = Object.keys(tboxConfig.env);
        for (let i = 0; i < keys.length; ++i) {
            definitions[`process.env.${keys[i]}`] = `"${tboxConfig.env[keys[i]]}"`;
        }

        const compiler = webpack({
          target: 'node',
          mode: 'development',
          devtool: 'inline-source-map',
          node: { __dirname: false },
          watch: true,
          resolve: {
            extensions: [ '.ts', '.js' ],
            alias: {
              '@': path.resolve(api.getCwd(), 'src')
            }
          },
          externals,
          entry: [ 'webpack/hot/poll?1000', path.resolve(api.getCwd(), 'src', 'index.ts') ],
          output: {
            path: path.resolve(api.getCwd(), '.build'),
            filename: 'server.js'
          },
          module: {
            rules: [
              { test: /\.ts$/, include: /src/, loader: require.resolve('ts-loader'), options: { transpileOnly: true } }
            ]
          },
          plugins: [
            new webpack.DefinePlugin(definitions),
            new webpack.HotModuleReplacementPlugin()
          ]
        });

        let proc = null;
        const watching = compiler.watch({
          aggregateTimeout: 300,
          poll: undefined
        }, (err, stats) => {
          console.log('-- Compiling Finished');
          if (proc === null) {
            proc = execa('node', [path.resolve(api.getCwd(), '.build', 'server.js'), '--inspect'], { stdio: ['inherit', 'inherit', 'inherit'], cleanup: true });
          }
        });
      }
    )

  } else {
    api.exitLog('-- Typescript module and Router module is required.');
  }
}