import { createBeforeDecorator, Status, JsonResult } from '../src';

export function Authorize(...perms: string[]) {
    return createBeforeDecorator(function() {
        let result = new JsonResult();
        result.status = Status.Unauthorized;
        result.body = { message: 'Unauthorized Attribute' };
        return result;
    });
}