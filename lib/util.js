const path = require('path');
const os = require('os');
const fs = require('fs');
const minimist = require('minimist');
const _ = require('lodash');
const format = require('util').format;

const _argv = minimist(process.argv.slice(2));

class ConfigError extends Error {
    constructor (...args) {
        super(format(...args));
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = this.constructor.code;
    }
    static get code () {
        return 'ERR_CONFIG';
    }
}

// Resolve file path with support for home char
function resolvePath (str, dir) {
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

// Resolve file path if it exists
// Checks for home char, existing file, require path, cjs, mjs
// Throws error if not found
function resolvePathIfExists (str, dir) {

    let file = resolvePath(str, dir);

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
                    throw new ConfigError(`Failed to resolve file path: ${str}`);
                }
            }
        }
    }

    return file;

}

// Getter/setter for env vars
function env (key, val) {
    if (_.isString(key)) {
        if (val !== undefined && isUndefined(process.env[key])) {
            return process.env[key] = val;
        } else {
            return isUndefined(process.env[key]) ? undefined : process.env[key];
        }
    }
    return process.env;
}

// Get argv by key, return argv if no key passed
function argv (key) {
    if (arguments.length === 1) {
        return _argv[key];
    } else {
        return _argv;
    }
}

// Test if running in esm or commonjs mode
function isEsmMode () {
    return typeof module === 'undefined';
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object
function isModule (obj) {
    return !_.isNil(obj) && obj[Symbol.toStringTag] === 'Module';
}

function isPromise (p) {
    return p instanceof Promise || Promise.resolve(p) === p;
}

function isError (obj) {
    return Error.prototype.isPrototypeOf(obj);
}

// If a value is never set on process.env it will return typeof undefined
// If a value was set on process.env that was of type undefined it will become typeof string 'undefined'
// We want to test for both
function isUndefined (val) {
    return (val === undefined || val === 'undefined');
}

function flattenAndCompact (...args) {
    return Array.prototype.concat.call([], ...args).filter(Boolean);
}

// Recursively freeze an object to become immutable
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

// Resolve an object with defaults recursively
// Accepts multiple sources
// Filters keys based on provided defaults (last arg)
function defaults (...args) {

    let accumulator = {};

    function iterate (res, obj, def) {
        _.forOwn(obj, (val, key) => {
            if (_.has(def, key)) {
                if (_.isPlainObject(def[key])) {
                    res[key] = iterate(_.toPlainObject(res[key]), val, def[key]);
                } else {
                    if (res[key] === undefined) {
                        res[key] = val;
                    }
                }
            }
        });
        return res;
    }

    args.map(obj => {
        iterate(accumulator, obj, args.at(-1));
    });

    return accumulator;

}

exports.ConfigError = ConfigError;
exports.resolvePath = resolvePath;
exports.resolvePathIfExists = resolvePathIfExists;
exports.env = env;
exports.argv = argv;
exports.isEsmMode = isEsmMode;
exports.isModule = isModule;
exports.isPromise = isPromise;
exports.isError = isError;
exports.isUndefined = isUndefined;
exports.flattenAndCompact = flattenAndCompact;
exports.deepFreeze = deepFreeze;
exports.defaults = defaults;
