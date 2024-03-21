const path = require('path');
const os = require('os');
const fs = require('fs');
const _ = require('lodash');

// resolve path with support for home character
function resolveFilePath (str) {
    if (str && str[0] === '~') {
        return path.normalize(path.join(os.homedir(), str.slice(1)));
    } else {
        return path.resolve(str);
    }
}

// resolve file path if it exists
// checks for home char, existing file, require path, then cjs
// throws error if not found
function resolveFilePathIfExists (str) {

    let file = resolveFilePath(str);

    try {
        fs.accessSync(file, fs.constants.F_OK);
    } catch (err) {
        try {
            file = require.resolve(file);
        } catch (err) {
            try {
                fs.accessSync(file += '.cjs', fs.constants.F_OK);
            } catch (err) {
                throw new Error(`Failed to resolve file path: ${str}`);
            }
        }
    }

    return file;

}

// if a value is never set on process.env it will return typeof undefined
// if a value was set on process.env that was of type undefined if will become typeof string 'undefined'
// we want to test for both
function isUndefined (val) {
    return (val === undefined || val === 'undefined');
}

function deepFreeze (obj, cache) {

    cache = cache || new Map();

    _.forIn(obj, (val, key) => {
        if ((_.isPlainObject(val) || _.isArray(val)) && !cache.has(val)) {
            cache.set(val);
            deepFreeze(val, cache);
        }
    });

    return Object.freeze(obj);

}

exports.resolveFilePath = resolveFilePath;
exports.resolveFilePathIfExists = resolveFilePathIfExists;
exports.isUndefined = isUndefined;
exports.deepFreeze = deepFreeze;
