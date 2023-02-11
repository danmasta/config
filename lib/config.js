const path = require('path');
const minimist = require('minimist');
const _ = require('lodash');

const argv = minimist(process.argv.slice(2));

const defaults = {
    enableArgv: false,
    enableEnv: false,
    setNodeEnv: false,
    configDir: path.resolve(process.cwd(), 'config'),
    configGroup: undefined,
    config: undefined,
    configId: undefined,
    defaultConfigFileName: 'default'
};

class ConfigError extends Error {

    constructor (msg) {
        super(msg);
        Error.captureStackTrace(this, ConfigError);
        this.name = 'ConfigError';
        this.code = 'CONFIGERROR';
    }

}

class Config {

    constructor (opts) {

        opts = this._opts = _.defaultsDeep(opts, defaults);

        if (opts.setNodeEnv) {
            this.env('NODE_ENV', 'development');
        }

        if (opts.enableEnv) {

            if (_.isString(this.env('CONFIG_DIR'))) {
                opts.configDir = path.resolve(this.env('CONFIG_DIR'));
            }

            if (this.env('CONFIG_GROUP')) {
                opts.configGroup = this.env('CONFIG_GROUP');
            }

            if (this.env('CONFIG')) {
                opts.config = this.env('CONFIG');
            }

            if (this.env('CONFIG_ID')) {
                opts.configId = this.env('CONFIG_ID');
            }

        }

        if (opts.enableArgv) {

            if (_.isString(this.argv('config-dir'))) {
                opts.configDir = path.resolve(this.argv('config-dir'));
            }

            if (this.argv('config-group')) {
                opts.configGroup = this.argv('config-group');
            }

            if (this.argv('config')) {
                opts.config = this.argv('config');
            }

            if (this.argv('config-id')) {
                opts.configId = this.argv('config-id');
            }

        }

    }

    env (...args) {

        let key = args[0];
        let val = args[1];

        if (args.length === 2) {
            if (val !== undefined) {
                return process.env[key] = (Config.isUndefined(process.env[key]) ? val : process.env[key]);
            }
        }

        if (_.isString(key)) {
            return Config.isUndefined(process.env[key]) ? undefined : process.env[key];
        }

        return process.env;

    }

    // argv should always be a string or undefined
    argv (key) {

        if (_.isString(key)) {
            return argv[key];
        }

        return argv;

    }

    static deepFreeze (obj, cache) {

        cache = cache || new Map();

        _.forIn(obj, (val, key) => {
            if ((_.isPlainObject(val) || _.isArray(val)) && !cache.has(val)) {
                cache.set(val);
                Config.deepFreeze(val, cache);
            }
        });

        return Object.freeze(obj);

    }

    // if a value is never set on process.env it will return typeof undefined
    // if a value was set on process.env that was of type undefined if will become typeof string 'undefined'
    // we want to test for both
    static isUndefined (val) {
        return (val === undefined || val === 'undefined');
    }

    loadFromFile (file) {

        file = path.resolve(file);

        let contents = null;
        let ext = path.extname(file);

        try {
            switch (ext) {
                case '':
                case '.js':
                case '.json':
                    contents = require(file);
                    break;
                default:
                    throw new ConfigError(`File type not supported: ${ext}`);
            }
        } catch (err) {
            throw new ConfigError(`Failed to load config file: ${err.name}: ${err.message}`);
        }

        return contents;

    }

    loadFromDir (dir) {

        let res = {};
        let opts = this._opts;

        [opts.defaultConfigFileName, this.env('NODE_ENV'), opts.configGroup, opts.config, opts.configId].map(file => {

            if (file) {
                _.merge(res, this.loadFromFile(path.resolve(dir, file)));
            }

        });

        return Config.deepFreeze(res);

    }

    load () {
        return this.loadFromDir(this._opts.configDir);
    }

    resolve () {
        return this.loadFromDir(this._opts.configDir);
    }

}

module.exports = Config;
