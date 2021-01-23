function jsToLua(obj) {
    return valToLua(obj, -1)
}

function objToLua(obj, indentLevel=0) {
    const lines = Object.entries(obj).map(([key, val]) => {
        const valStr = valToLua(val, indentLevel);
        return `    ${key} = ${valStr},`;
    });

    return '{\n' + [
        ...lines,
        '}'
    ].map(line => '    '.repeat(indentLevel) + line).join('\n')
}

function arrToLua(arr, indentLevel=0) {
    const lines = arr.map((val) => {
        const valStr = valToLua(val, indentLevel);
        return `    ${valStr},`;
    });

    return '{\n' + [
        ...lines,
        '}'
    ].map(line => '    '.repeat(indentLevel) + line).join('\n')
}

function valToLua(val, indentLevel) {
    let valStr = ''
    switch (typeof val) {
        case 'string':
            valStr = `'${val}'`
            break;
        case 'number':
            valStr = val.toString();
            break;
        case 'boolean':
            valStr = val ? 'True' : 'False';
            break;
        case 'undefined':
            valStr = 'Nil';
            break;
        case 'object':
            if (val === null) {
                valStr = 'Nil';
            } else if (Array.isArray(val)) {
                valStr = arrToLua(val, indentLevel + 1);
            } else {
                valStr = objToLua(val, indentLevel + 1);
            }
            break;
    }

    return valStr;
}

module.exports = jsToLua;
