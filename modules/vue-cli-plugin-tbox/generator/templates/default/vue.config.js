module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: '<%= protocol %>://<%= hostname %>:<%= port %>'
      }
    }
  }
}