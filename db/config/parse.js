const Tokenizr = require('tokenizr');

let start = /Spec<.*>\(/g;
let end = /\);/;
let splice = function(str, index, count, add) {
    if (index < 0) {
        index = str.length + index;
        if (index < 0) {
            index = 0;
        }
    }
    return str.slice(0, index) + (add || '') + str.slice(index + count);
};

// Spec<Person>(x => x.FirstName == data)

exports.parse = function(contents) {
    let match = start.exec(contents);
    let matches = [];
    while (match !== null) {
        let specCall = match[0];

        var arrow = '';
        for (let i = match.index + match[0].length; i < contents.length; ++i) {
            arrow += contents[i];
            if (end.test(arrow)) break;
        }
        let fullMatch = match[0] + arrow;
        arrow = arrow.replace(');', '');
        let tokens = tokenize(arrow);
        let replacement = arrow;
        if (tokens.length > 0) {
            let uniq = [...new Set(tokens.map(x => x.value))];
            replacement += ', { ' + uniq.map(x => `"${x}": ${x}`).join(',') + ' }';
        }

        contents = splice(contents, match.index, fullMatch.length, fullMatch.replace(arrow, replacement));
        match = start.exec(contents);
    }
    return contents;
}

let ignore = (ctx) => ctx.ignore();

function tokenize(arrow) {
    let lexor = new Tokenizr();
    let param = '';
    lexor.rule(/^.*=>/, (ctx, match) => {
        param = match[0].replace('=>', '').trim();
        ctx.ignore();
    });
    let ignoreableRules = [ /==+/, /!=+/, />=*/, /<=*/, /!/, /\|\|/, /\(/, /\)/, /&&/, /['|"].*['|"]/, / *new .*\(.*\)/ ];
    for (let i = 0; i < ignoreableRules.length; ++i) lexor.rule(ignoreableRules[i], (ctx) => ctx.ignore());

    lexor.rule(/ *[a-zA-Z\.]*\([a-zA-Z\.,]*\)/, (ctx, match) => {
        let value = match[0].trim();
        if (value !== '' && value.indexOf(`${param}.`) === -1) {
            ctx.accept('func', value);
        } else {
            ctx.ignore();
        }
    });

    lexor.rule(/ *[a-zA-Z\.]*/, (ctx, match) => {
        let value = match[0].trim();
        if (value !== '' && value.indexOf(`${param}.`) === -1) {
            ctx.accept('var', value);
        } else {
            ctx.ignore();
        }
    });
    try {
        lexor.input(arrow.replace(/(\r\n|\r|\n)/g, '').trim());
        let tokens = lexor.tokens();
        return tokens.filter(x => x.type === 'var' || x.type === 'func');
    } catch(err) {
        console.log(`Pos: ${err.pos}`);
        console.log(`Line: ${err.line}`);
        console.log(`Col: ${err.column}`);
        console.log(`Input: '${err.input}'`);
        return [];
    }
}