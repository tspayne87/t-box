# Results
The results are the objects that handle what is sent down from the server, these can be extended on if something is done often in your project.

## AssetResult
The asset result is a way to handle assets that need to be sent down from the server but are not public like the static results.
## CssResult
The css result is meant to deal with custom css strings that need to be sent down from the server.
## FileResult
The file result handles sending down downloadedable files that are processed by the server and are not stored on the server.
## HtmlResult
The html result deals with an html string that needs to be passed to the client.
## JsonResult
The json result is the main structure that is used it will take an object and stringify it for the response for the client.
## RedirectResult
The redirect result that is mean to redirect to another url instead of this one.
## Status
The status enum that can be used as short-hand for status codes.

## Examples
Basic usage of all the results supplied by T-box:
```typescript
    import { Route, Get, AssetResult, CssResult, FileResult, HtmlResult, JsonResult } from '@t-box/server';

    @Route('example')
    export class ExampleController extends Controller {

        @Get('[action]')
        public async asset() {
            return new AssetResult('example.txt');
        }

        @Get('[action]')
        public async css() {
            return new CssResult('body { background-color: blue }');
        }

        @Get('[action]')
        public async file() {
            let buffer = new Buffer();
            return new FileResult('example.txt', buffer);
        }

        @Get('[action]')
        public async html() {
            return new HtmlResult('<html><body><head><title>Hello World</title></head></body></html>');
        }

        @Get('[action]')
        public async json() {
            return new JsonResult({ example: 'object' });
        }
    }
```

Extending from the result object:
```typescript
    import { Result } from '@t-box/server';
    import { ServerResponse } from 'http';

    /**
     * A result that handles a basic object and stringifies it to send to the client.
     */
    export class JsonResult extends Result {
        /**
         * Method will need to be override so that the object can add some extra processing.
         * 
         * @param res The server response object that we need to work with when processing this result.
         */
        public async processResponse(res: ServerResponse) {
            // Deal with some headers.
            this.headers['Content-Type'] = 'application/json';
            // Deal with what needs to be sent for the body.
            this.body = this.body === undefined ? 'null' :  JSON.stringify(this.body);
            super.processResponse(res);
        }
    }
```