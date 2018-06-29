let files = require.context('./modules', true, /\.vue$/);

let clientCache: any = {};
files.keys().forEach(key => clientCache[key] = files(key));
console.log(clientCache);