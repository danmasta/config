const path = require('path');
const minimist = require('minimist');
const _ = require('lodash');
const util = require('./util');

const argv = minimist(process.argv.slice(2));

const defaults = {
    enableArgv: false,
    enableEnv: false,
    setNodeEnv: false,
    configDir: path.resolve('config'),
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
        return _.isString(key) ? argv[key] : argv;
    }

    // return list of files to import
    getFileList () {
        let res = [];
        [
            this.opts.defaultConfigFileName,
            this.env('NODE_ENV'),
            this.opts.configGroup,
            this.opts.config,
            this.opts.configId
        ].forEach(str => {
            if (str) {
                res.push(util.resolveFilePath(str, this.opts.configDir));
            }
        });
        return res;
    }

    // return list of all files as an object, promise, or error
    getFileListContents () {
        return this.getFileList().map(str => {
            try {
                return util.requireOrImport(str);
            } catch (err) {
                return err;
            }
        });
    }

    // returns promise only if a file requires import or async is true
    resolveAsyncConditional (async) {

        let conf = {};

        let files = this.getFileList().map(str => {
            try {
                let file = util.requireOrImport(str);
                if (util.isPromise(file)) {
                    if (async === false) {
                        throw new ConfigError(`Failed to load config, requires async: ${str}`);
                    } else {
                        async = true;
                    }
                    return file;
                } else {
                    return file;
                }
            } catch (err) {
                if (async === true) {
                    return Promise.reject(err);
                } else if (this.opts.throw) {
                    throw err;
                } else {
                    return err;
                }
            }
        });

        if (async) {

            return Promise.allSettled(files).then(files => {

                files.map(file => {
                    if (file.status === 'rejected' || Error.isPrototypeOf(file.value)) {
                        if (this.opts.throw) {
                            throw file.reason || file.value;
                        } else if (this.opts.warn) {
                            console.warn(file.reason?.message || file.value?.message);
                        }
                    } else {
                        if (util.isModule(file.value)) {
                            _.merge(conf, file.value.default);
                        } else {
                            _.merge(conf, file.value);
                        }
                    }
                });

                return util.deepFreeze(conf);

            });

        } else {

            files.map(file => {
                if (Error.isPrototypeOf(file)) {
                    if (this.opts.throw) {
                        throw file;
                    } else if (this.opts.warn) {
                        console.warn(file.message);
                    }
                } else {
                    _.merge(conf, file);
                }
            });

            return util.deepFreeze(conf);

        }

    }

    // always returns promise
    resolveAsync () {
        return this.resolveAsyncConditional(true);
    }

    // always sync, does not support import
    resolve () {
        return this.resolveAsyncConditional(false);
    }

    load () {
        return this.resolve();
    }

}

module.exports = Config;
