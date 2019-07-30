import { Status, JsonResult, Result, ServerRequestWrapper, BeforeAction, IAction } from '../src';

export function Authorize(...perms: string[]): any {
    @BeforeAction
    class Authorize implements IAction {
        constructor(private _req: ServerRequestWrapper) { }

        public processAction(): Result | Promise<Result | undefined> | undefined {
            let result = new JsonResult();
            result.status = Status.Unauthorized;
            result.data = { message: 'Unauthorized Attribute' };
            return result;
        }
    }

    return Authorize;
}