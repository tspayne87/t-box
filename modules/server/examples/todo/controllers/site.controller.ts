import { Controller, Route, Get, AssetResult } from '../../../src';

@Route()
export class SiteController extends Controller {
    @Get('/*')
    public index() {
        return new AssetResult('index.html');
    }
}