module.exports = [
  {
    type: 'confirm',
    name: 'addExamples',
    message: 'Add example module',
    description: 'This will generate an example module to work from',
    default: false
  },
  {
    type: 'input',
    name: 'vuePort',
    message: 'Vue Dev Port',
    description: 'This is the vue dev server port',
    default: '8080'
  },
  {
    type: 'input',
    name: 'port',
    message: 'Server Port',
    description: 'This is the port for the T-Box server to listen on',
    default: '8081'
  },
  {
    type: 'input',
    name: 'hostname',
    message: 'Host Name',
    description: 'This is the hostname for the T-Box server to bind to',
    default: 'localhost'
  },
  {
    type: 'list',
    name: 'protocol',
    message: 'Protocol',
    description: 'The prrotocol for the T-Box server to use',
    default: 'http',
    choices: [ 'http', 'https' ]
  }
];