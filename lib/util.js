const path = require('path');
const os = require('os');
const fs = require('fs');
const _ = require('lodash');

// resolve file path with support for home char
function resolveFilePath (str, dir) {
    if (str && str[0] === '~') {
        return path.normalize(path.join(os.homedir(), str.slice(1)));
    } else {
        if (dir) {
            return path.resolve(dir, str);
        } else {
            return path.resolve(str);
        }
    }
}

// resolve file path if it exists
// checks for home char, existing file, require path, cjs, mjs
// throws error if not found
function resolveFilePathIfExists (str) {

    let file = resolveFilePath(str);

    try {
        fs.accessSync(file, fs.constants.F_OK);
    } catch {
        try {
            file = require.resolve(file);
        } catch {
            try {
                fs.accessSync(file + '.cjs', fs.constants.F_OK);
                file += '.cjs';
            } catch {
                try {
                    fs.accessSync(file + '.mjs', fs.constants.F_OK);
                    file += '.mjs';
                } catch {
                    throw new Error(`Failed to resolve file path: ${str}`);
                }
            }
        }
    }

    return file;

}

// conditionally require or import based on esm-ness
function requireOrImport (str) {

    let file = resolveFilePathIfExists(str);
    let ext = path.extname(file);

    switch (ext) {
        case '.json':
            if (isEsmMode()) {
                return import(str, { assert: { type: 'json' }});
            } else {
                return require(file);
            }
        case '.js':
        case '.cjs':
            if (isEsmMode()) {
                return import(file);
            } else {
                try {
                    return require(file);
                } catch (err) {
                    if (err.code === 'ERR_REQUIRE_ESM' || err.code === 'ERR_REQUIRE_ASYNC_MODULE') {
                        return import(file);
                    }
                    throw err;
                }
            }
            break;
        case '.mjs':
            return import(file);
        default:
            throw new Error(`File type not supported: ${file}`);
    }

}

// test if running in esm or commonjs mode
function isEsmMode () {
    return typeof module === 'undefined';
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object
function isModule (obj) {
    return obj[Symbol.toStringTag] === 'Module';
}

function isPromise (p) {
    return p instanceof Promise || Promise.resolve(p) === p;
}

// if a value is never set on process.env it will return typeof undefined
// if a value was set on process.env that was of type undefined if will become typeof string 'undefined'
// we want to test for both
function isUndefined (val) {
    return (val === undefined || val === 'undefined');
}

// recursively freeze an object to become immutable
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
exports.requireOrImport = requireOrImport;
exports.isEsmMode = isEsmMode;
exports.isModule = isModule;
exports.isPromise = isPromise;
exports.isUndefined = isUndefined;
exports.deepFreeze = deepFreeze;
