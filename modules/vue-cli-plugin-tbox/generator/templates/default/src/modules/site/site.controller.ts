import { Controller, Route, Get, AssetResult } from '@t-box/server';

@Route()
export class SiteController extends Controller {
  @Get('/*')
  public index() {
    return new AssetResult('index.html');
  }
}
