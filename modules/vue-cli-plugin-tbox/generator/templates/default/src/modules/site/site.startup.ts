import { IApplication } from '@t-box/server';
import { SiteController } from './site.controller';

export default function startUp(app: IApplication) {
  // Add Site Controllers
  app.addControllers(SiteController);
}