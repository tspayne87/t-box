const fs = require('fs');

module.exports = (api, options, rootOptions) => {
  if (api.hasPlugin('typescript') && api.hasPlugin('router')) {
    api.extendPackage({
      scripts: {
        'build:server': 'vue-cli-service tbox:build',
        'serve:server': 'vue-cli-service tbox:serve'
      },
      dependencies: {
        '@t-box/server': '^0.4.8'
      },
      devDependencies: {
        '@types/formidable': '^1.0.31',
        'axios': '^0.19.2',
        'ts-loader': '^7.0.0'
      }
    });

    api.render('./templates/default', {
      ...options
    });

    // Add examples if it was selected
    if (options.addExamples) {
      api.render('./templates/example', {
        ...options
      });
    }

    api.afterInvoke(() => {
      // Write new values to the tsconfig.json
      const tsconfig = require(api.resolve('tsconfig.json'));
      tsconfig.compilerOptions.emitDecoratorMetadata = true;
      fs.writeFileSync(api.resolve('tsconfig.json'), JSON.stringify(tsconfig, null, 4), { encoding: 'utf8' });
    });
  }
}