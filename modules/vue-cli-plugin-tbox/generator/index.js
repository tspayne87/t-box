const fs = require('fs');

module.exports = (api, options, rootOptions) => {
  if (api.hasPlugin('typescript') && api.hasPlugin('router')) {
    api.extendPackage({
      dependencies: {
        '@t-box/server': '^0.4.8'
      },
      devDependencies: {
        'axios': '^0.19.2'
      }
    });

    api.render('./templates/default', {
      ...options
    });

    if (options.addExamples) {
      api.render('./templates/example', {
        ...options
      });
    }
    api.exitLog('-- Done Creating Modules.');
  }
}