const _ = require('lodash');
const util = require('./util');
const FileResolver = require('./resolver');

const defaults = {
    enableArgv: false,
    enableEnv: false,
    setNodeEnv: false,
    dir: './config',
    group: undefined,
    config: undefined,
    id: undefined,
    defaultFileName: 'default',
    warn: false,
    throw: false
};

class Config {

    constructor (opts) {

        this.opts = opts = util.defaults(opts, defaults);

        if (this.opts.setNodeEnv) {
            util.env('NODE_ENV', 'development');
        }

        this.refreshResolver();

    }

    // Resolve options in order of: local var, env var, argv
    getRefreshOpts () {

        let res = {};

        _.forOwn({
            dir: {
                env: 'CONFIG_DIR',
                argv: 'config-dir'
            },
            group: {
                env: 'CONFIG_GROUP',
                argv: 'config-group'
            },
            config: {
                env: 'CONFIG',
                argv: 'config'
            },
            id: {
                env: 'CONFIG_ID',
                argv: 'config-id'
            }
        }, (opt, key) => {

            if (_.has(this.opts, key)) {
                res[key] = this.opts[key];
            }

            if (this.opts.enableEnv) {
                if (util.env(opt.env)) {
                    res[key] = util.env(opt.env);
                }
            }

            if (this.opts.enableArgv) {
                if (util.argv(opt.key)) {
                    res[key] = util.argv(opt.key);
                }
            }

        });

        res.files = util.flattenAndCompact([
            this.opts.defaultFileName,
            util.env('NODE_ENV'),
            res.group,
            res.config,
            res.id
        ]);

        return res;

    }

    // Refresh file resolver or create
    refreshResolver () {
        if (!this.resolver) {
            this.resolver = new FileResolver(this.getRefreshOpts());
        } else {
            this.resolver.refresh(this.getRefreshOpts());
        }
    }

    resolveConditional (async) {

        let conf = {};
        let res = this.resolver.resolveConditional(async);

        let handleFiles = (files) => {
            files.map(file => {
                if (file.error) {
                    this.handleError(file.error);
                } else {
                    if (util.isModule(file.contents)) {
                        _.merge(conf, file.contents.default);
                    } else {
                        _.merge(conf, file.contents);
                    }
                }
            });
            return util.deepFreeze(conf);
        };

        // We need to double check the state here for cases when
        // running in esm mode and env config is also loading asynchronously
        if (util.isPromise(res)) {
            return res.then(files => {
                this.refreshResolver();
                if (files.length !== this.resolver.opts.files.length) {
                    return this.resolver.resolveConditional(async).then(handleFiles);
                } else {
                    return handleFiles(files);
                }
            });
        } else {
            return handleFiles(res);
        }

    }

    resolve () {
        return this.resolveConditional(false);
    }

    resolveAsync () {
        return this.resolveConditional(true);
    }

    handleError (err) {
        if (err.code !== util.ConfigError.code) {
            throw err;
        } else {
            if (this.opts.throw) {
                throw err;
            } else if (this.opts.warn) {
                console.warn(`${err.name}: ${err.message}`);
            }
        }
    }

    static get defaults () {
        return defaults;
    }

    static factory () {
        let Fn = this;
        return function factory (...args) {
            return new Fn(...args);
        };
    }

}

module.exports = Config;
