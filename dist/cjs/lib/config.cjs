var lo = require('@danmasta/lo');
var errors = require('@danmasta/lo/errors');
var minimist = require('minimist');
var resolver = require('./resolver.cjs');

const argv = minimist(process.argv.slice(2));

const defs = {
    enableArgv: true,
    enableEnv: true,
    setNodeEnv: false,
    dir: './config',
    group: undefined,
    config: undefined,
    id: undefined,
    defaultFileName: 'default',
    warn: false,
    throw: false,
    ext: ['.js', '.json', '.cjs', '.mjs']
};

class Config {

    constructor (opts) {
        this.opts = opts = lo.defaults(opts, defs);
        if (opts.setNodeEnv) {
            lo.env('NODE_ENV', 'development');
        }
        this.refreshResolver();
    }

    // Resolve options in order of: local var, env var, argv
    getRefreshOpts () {
        let opts = this.opts;
        let args = {
            dir: {
                argv: 'config-dir',
                env: 'CONFIG_DIR'
            },
            group: {
                argv: 'config-group',
                env: 'CONFIG_GROUP'
            },
            config: {
                argv: 'config',
                env: 'CONFIG'
            },
            id: {
                argv: 'config-id',
                env: 'CONFIG_ID'
            }
        };
        let res = {};
        lo.forOwn(args, (opt, key) => {
            if (lo.hasOwn(opts, key)) {
                res[key] = opts[key];
            }
            if (opts.enableEnv) {
                if (lo.notNil(lo.env(opt.env))) {
                    res[key] = lo.env(opt.env);
                }
            }
            if (opts.enableArgv) {
                if (lo.notNil(argv[opt.argv])) {
                    res[key] = argv[opt.argv];
                }
            }
        });
        res.files = lo.compact([
            opts.defaultFileName,
            lo.env('NODE_ENV'),
            res.group,
            res.config,
            res.id
        ]);
        res.ext = opts.ext;
        return res;
    }

    // Refresh file resolver or create
    refreshResolver () {
        if (!this.resolver) {
            this.resolver = new resolver(this.getRefreshOpts());
        } else {
            this.resolver.refresh(this.getRefreshOpts());
        }
    }

    async resolve () {
        let conf = {};
        let files = await this.resolver.resolve();
        // Need to double check the state here for cases when
        // env is also loading asynchronously
        // this.refreshResolver();
        // if (files.length !== this.resolver.opts.files.length) {
        //     files = await this.resolver.resolve();
        // }
        lo.eachNotNil(files, file => {
            if (file.error) {
                this.handleError(file.error);
            } else {
                if (lo.isModule(file.contents)) {
                    lo.merge(conf, file.contents.default);
                } else {
                    lo.merge(conf, file.contents);
                }
            }
        });
        return lo.freeze(conf);
    }

    resolveSync () {
        let conf = {};
        let files = this.resolver.resolveSync();
        lo.eachNotNil(files, file => {
            if (file.error) {
                this.handleError(file.error);
            } else {
                lo.merge(conf, file.contents);
            }
        });
        return lo.freeze(conf);
    }

    handleError (err) {
        if (err.code !== errors.NotFoundError.code) {
            throw err;
        } else {
            if (this.opts.throw) {
                throw err;
            }
            if (this.opts.warn) {
                console.warn(`${err.name}: ${err.message}`);
            }
        }
    }

    static get defaults () {
        return defs;
    }

    static factory () {
        let Fn = this;
        return function factory (...args) {
            return new Fn(...args);
        };
    }

}

module.exports = Config;
