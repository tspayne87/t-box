import { IApplication } from '@t-box/server';
import { ExampleController } from './example.controller';

export default function startUp(app: IApplication) {
  // Add Site Controllers
  app.addControllers(ExampleController);
}
