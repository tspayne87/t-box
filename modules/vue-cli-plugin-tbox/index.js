const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const { execa } = require('@vue/cli-shared-utils');

module.exports = (api, options) => {
  if (api.hasPlugin('typescript') && api.hasPlugin('router')) {
    function getConfig(env) {
      const externals = [ env === 'development' ? nodeExternals({ whitelist: [ 'webpack/hot/poll?1000' ] }) : nodeExternals() ];
      const tboxConfig = require(path.resolve(api.getCwd(), 'tbox.json'));
      const bundleOutputDir = path.join(api.getCwd(), env === 'development' ? '.build' : '.release');

      const config = {
        target: 'node',
        mode: env,
        node: { __dirname: false },
        resolve: {
          extensions: [ '.ts', '.js' ],
          alias: {
            '@': path.resolve(api.getCwd(), 'src')
          }
        },
        externals,
        entry: [ path.resolve(api.getCwd(), 'src', 'index.ts') ],
        output: {
          path: bundleOutputDir,
          filename: 'server.js'
        },
        module: {
          rules: [
            { test: /\.ts$/, include: /src/, loader: require.resolve('ts-loader'), options: { transpileOnly: true } }
          ]
        },
        plugins: []
      };

      if (env === 'development') {
        config.devtool = 'inline-source-map';
        config.watch = true;

        config.entry.unshift('webpack/hot/poll?1000');

        // Set-up definitions from the node enviornment
        let definitions = { 'process.env.NODE_ENV': '"development"' };
        const keys = Object.keys(tboxConfig.env);
        for (let i = 0; i < keys.length; ++i) {
            definitions[`process.env.${keys[i]}`] = `"${tboxConfig.env[keys[i]]}"`;
        }

        config.plugins.push(new webpack.DefinePlugin(definitions));
        config.plugins.push(new webpack.HotModuleReplacementPlugin());
      }
      return config;
    }

    api.registerCommand(
      'tbox:serve',
      {
        description: 'Run the T-Box server and watch the sources to restart automatically',
        usage: 'vue-cli-service tbox:serve'
      },
      args => {
        const compiler = webpack(getConfig('development'));

        let proc = null;
        compiler.watch({ aggregateTimeout: 300, poll: undefined }, (err, stats) => {
          console.log('-- Compiling Finished');
          if (proc === null) {
            proc = execa('node', [path.resolve(api.getCwd(), '.build', 'server.js'), '--inspect'], { stdio: ['inherit', 'inherit', 'inherit'], cleanup: true });
          }
        });
      }
    );

    api.registerCommand(
      'tbox:build',
      {
        description: 'Build the T-Box server for production',
        usage: 'vue-cli-service tbox:build'
      },
      args => {
        const compiler = webpack(getConfig('production'));
        compiler.run((err, stat) => {
          console.log('-- Compiling Finished');
        });
      }
    )

  } else {
    api.exitLog('-- Typescript module and Router module is required.');
  }
}