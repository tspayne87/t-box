import { Server } from 'http';
import { Application } from '@t-box/server';

export default async function boot(server: Server) {
  const app = new Application({ cwd: __dirname, staticFolders: ['public'], assetDir: 'public', compress: true });
  await app.startup(require.context('./modules', true, /startup\.ts$/));
  await app.bootstrap(server);
}