const path = require('path');

module.exports = {
  outputDir: path.resolve(__dirname, '.release', 'public'),
  devServer: {
    proxy: {
      '^/api': {
        target: '<%= protocol %>://<%= hostname %>:<%= port %>'
      }
    }
  }
}
