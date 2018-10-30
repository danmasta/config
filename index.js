const env = require('@danmasta/env');
const path = require('path');
const minimist = require('minimist');
const _ = require('lodash');

// cmd args
const argv = minimist(process.argv.slice(2));

// recursively freeze an object and all of it's properties
// returns an immutable, constant object that cannot be modified
function deepFreeze(obj, cache) {

    cache = cache || new Map();

    _.forIn(obj, (val, key) => {
        if ((_.isPlainObject(val) || _.isArray(val)) && !cache.has(val)) {
            cache.set(val);
            deepFreeze(val, cache);
        }
    });

    return Object.freeze(obj);

}

// loads config files from specified directory
// attempts to load files in order based on
// environment variable values
function getConfigFromDir(dir) {

    const config = {};

    ['default', env('NODE_ENV'), env('CONFIG_GROUP'), env('CONFIG'), env('CONFIG_ID')].map(file => {

        try {

            if (file) {
                _.merge(config, require(path.resolve(dir, file)));
            }

        } catch (err) {

            if (env('DEBUG')) {
                console.error(`Config: ${err.message}`);
            }

        }

    });

    // deep merge current config with file path contents or object
    // overwrites any existing properties
    // returns a new immutable, constant object
    Object.defineProperty(config, '_merge', {
        configurable: false,
        writable: false,
        enumerable: false,
        value: function(obj) {

            if (_.isString(obj)) {
                obj = require(path.resolve(obj));
            }

            return deepFreeze(_.merge({}, this, obj));
        }
    });

    // deep merge current config with file path contents or object
    // for all properties that resolve to undefined
    // returns a new immutable, constant object
    Object.defineProperty(config, '_defaults', {
        configurable: false,
        writable: false,
        enumerable: false,
        value: function(obj) {

            if (_.isString(obj)) {
                obj = require(path.resolve(obj));
            }

            return deepFreeze(_.defaultsDeep({}, this, obj));
        }
    });

    // load config files from specified directory
    // returns a new immutable, constant object
    Object.defineProperty(config, '_from', {
        configurable: false,
        writable: false,
        enumerable: false,
        value: getConfigFromDir
    });

    return deepFreeze(config);

}

// configure via cmd args
// and env variables
function init() {

    let dir = argv['config-dir'];

    if (_.isString(dir)) {
        env('CONFIG_DIR', path.resolve(dir));
    } else {
        env('CONFIG_DIR', path.resolve(process.cwd(), 'config'));
    }

    env('CONFIG_GROUP', argv['config-group']);
    env('CONFIG', argv['config']);
    env('CONFIG_ID', argv['config-id']);

}

init();

// export immutable, constant object
module.exports = getConfigFromDir(env('CONFIG_DIR'));
