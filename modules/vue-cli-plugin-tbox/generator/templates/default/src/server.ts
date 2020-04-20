import { Application } from '@t-box/server';

export default async function boot() {
  const app = new Application({ cwd: __dirname, staticFolders: ['public'], assetDir: 'public', compress: true });
  await app.startup(require.context('./modules', true, /startup\.ts$/));
  return app;
}