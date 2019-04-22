import { createBeforeActionDecorator, Status, JsonResult, Result, ServerRequestWrapper, Injectable, BeforeAction } from '../src';

export function Authorize(...perms: string[]) {
    @Injectable
    class InternalAuthorize extends BeforeAction {
        constructor(private _req: ServerRequestWrapper) {
            super();
        }

        public beforeRequest(): Result | Promise<Result | undefined> | undefined {
            let result = new JsonResult();
            result.status = Status.Unauthorized;
            result.data = { message: 'Unauthorized Attribute' };
            return result;
        }
    }
    return createBeforeActionDecorator(InternalAuthorize);
}