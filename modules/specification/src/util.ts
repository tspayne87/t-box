import { Lexor } from './lexor';

export function tokenizeArrowFunc(arrowFunc: string) {
    let lexor = new Lexor();
    let param = '';
    lexor.singleRule(/^.*=>/, (match) => {
        param = match[0].replace('=>', '').trim();
        return { ignore: true };
    });

    lexor.singleRule(/^ +/, () => ({ ignore: true }));
    lexor.singleRule(/^(\r\n|\r|\n)/, () => ({ ignore: true }));

    //#region Rules for operators
    lexor.singleRule(/^&&/, () => ({ accept: 'and' }));
    lexor.singleRule(/^\|\|/, () => ({ accept: 'or' }));
    lexor.singleRule(/^==+/, () => ({ accept: 'eq' }));
    lexor.singleRule(/^!=+/, () => ({ accept: 'ne' }));
    lexor.singleRule(/^>=*/, match => ({ accept: /=/.test(match[0]) ? 'gte' : 'gt' }));
    lexor.singleRule(/^<=*/, match => ({ accept : /=/.test(match[0]) ? 'lte' : 'lt' }));
    lexor.singleRule(/^!/, () => ({ accept: 'not' }));
    //#endregion

    //#region Rules for Parentheses
    lexor.singleRule(/^\(/, () => ({ accept: 'opar' }));
    lexor.singleRule(/^\)/, () => ({ accept: 'cpar' }));
    //#endregion

    //#region Rules for values
    lexor.singleRule(/^null/, () => ({ accept: 'val' }));
    lexor.singleRule(/^undefined/, () => ({ accept: 'val', value: null }));
    lexor.singleRule(/^new .*\(.*\)/, match => ({ accept: 'val', value: eval(match) }));
    //#endregion

    //#region String rules
    lexor.startEndRule(/^'/, /[^\\]'$/, match => ({ accept: 'val', value: match.substring(1, match.length - 1) }));
    lexor.startEndRule(/^"/, /[^\\]"$/, match => ({ accept: 'val', value: match.substring(1, match.length - 1) }));
    //#endregion

    //#region Boolean rules
    lexor.singleRule(/^(true|false)/, match => ({ accept: 'val', value: match === 'true' }));
    //#endregion

    //#region Rules for reference, functions and variables
    lexor.singleRule(/^[a-zA-Z\.]*\([a-zA-Z\.,]*\)/, (match) => {
        let value = match.trim();
        if (value === '') return { ignore: true };
        if (value.indexOf(`${param}.`) === -1) {
            return { accept: 'var' };
        } else {
            return { accept: 'ref', value: value.replace(`${param}.`, '') };
        }
    });

    lexor.singleRule(/^[a-zA-Z\.]*/, (match) => {
        let value = match.trim();
        if (value === '') return { ignore: true };
        if (value.indexOf(`${param}.`) === -1) {
            return { accept: 'var' };
        } else {
            return { accept: 'ref', value: value.replace(`${param}.`, '') };
        }
    });
    //#endregion

    return lexor.parse(arrowFunc.trim());
}