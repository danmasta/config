import { compact, defaults, eachNotNil, env, forOwn, freeze, hasOwn, isModule, merge, notNil } from '@danmasta/lo';
import { NotFoundError } from '@danmasta/lo/errors';
import minimist from 'minimist';
import FileResolver from './resolver.js';

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

export default class Config {

    constructor (opts) {
        this.opts = opts = defaults(opts, defs);
        if (opts.setNodeEnv) {
            env('NODE_ENV', 'development');
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
        forOwn(args, (opt, key) => {
            if (hasOwn(opts, key)) {
                res[key] = opts[key];
            }
            if (opts.enableEnv) {
                if (notNil(env(opt.env))) {
                    res[key] = env(opt.env);
                }
            }
            if (opts.enableArgv) {
                if (notNil(argv[opt.argv])) {
                    res[key] = argv[opt.argv];
                }
            }
        });
        res.files = compact([
            opts.defaultFileName,
            env('NODE_ENV'),
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
            this.resolver = new FileResolver(this.getRefreshOpts());
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
        eachNotNil(files, file => {
            if (file.error) {
                this.handleError(file.error);
            } else {
                if (isModule(file.contents)) {
                    merge(conf, file.contents.default);
                } else {
                    merge(conf, file.contents);
                }
            }
        });
        return freeze(conf);
    }

    resolveSync () {
        let conf = {};
        let files = this.resolver.resolveSync();
        eachNotNil(files, file => {
            if (file.error) {
                this.handleError(file.error);
            } else {
                merge(conf, file.contents);
            }
        });
        return freeze(conf);
    }

    handleError (err) {
        if (err.code !== NotFoundError.code) {
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
