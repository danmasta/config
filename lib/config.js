const path = require('path');
const minimist = require('minimist');
const _ = require('lodash');
const util = require('./util');

const argv = minimist(process.argv.slice(2));

const defaults = {
    enableArgv: false,
    enableEnv: false,
    setNodeEnv: false,
    configDir: path.resolve(process.cwd(), 'config'),
    configGroup: undefined,
    config: undefined,
    configId: undefined,
    defaultConfigFileName: 'default',
    warn: false,
    throw: false
};

class ConfigError extends Error {

    constructor (msg) {
        super(msg);
        Error.captureStackTrace(this, ConfigError);
        this.name = 'ConfigError';
        this.code = 'CONFIG_ERROR';
    }

}

class Config {

    constructor (opts) {

        this.opts = opts = _.defaultsDeep(opts, defaults);

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
                return process.env[key] = (util.isUndefined(process.env[key]) ? val : process.env[key]);
            }
        }

        if (_.isString(key)) {
            return util.isUndefined(process.env[key]) ? undefined : process.env[key];
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

    loadFromFile (str) {

        let contents = null;

        try {
            let file = util.resolveFilePathIfExists(str);
            let ext = path.extname(file);
            switch (ext) {
                case '.js':
                case '.json':
                case '.cjs':
                    contents = require(file);
                    break;
                default:
                    throw new ConfigError(`File type not supported: ${ext}`);
            }
        } catch (err) {
            throw new ConfigError(err.message);
        }

        return contents;

    }

    loadFromDir (dir) {

        let res = {};
        let opts = this.opts;

        [opts.defaultConfigFileName, this.env('NODE_ENV'), opts.configGroup, opts.config, opts.configId].map(file => {

            if (file) {
                try {
                    _.merge(res, this.loadFromFile(path.resolve(dir, file)));
                } catch (err) {
                    if (opts.throw) {
                        throw err;
                    } else if (opts.warn) {
                        console.warn(err.message);
                    }
                }
            }

        });

        return util.deepFreeze(res);

    }

    load () {
        return this.loadFromDir(this.opts.configDir);
    }

    resolve () {
        return this.loadFromDir(this.opts.configDir);
    }

}

module.exports = Config;
