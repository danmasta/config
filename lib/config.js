import { ARGV, concat, defaults, each, eachNotNil, env, freeze, importOrRequireFiles, isModule, mapNotNil, merge, notNil, parseArgv, requireFiles } from 'lo';
import { NotFoundError } from 'lo/errors';

const argv = parseArgv(ARGV.slice(2));

const defs = {
    enableArgv: true,
    enableEnv: true,
    setNodeEnv: false,
    dir: './config',
    group: undefined,
    config: undefined,
    id: undefined,
    defaultFileName: 'default',
    defaultNodeEnv: 'development',
    warn: false,
    throw: false,
    exts: ['.js', '.json', '.cjs', '.mjs'],
    env: undefined
};

export default class Config {

    constructor (opts) {
        this.opts = opts = defaults(opts, defs);
        if (opts.setNodeEnv) {
            opts.env = opts.env || opts.defaultNodeEnv;
        }
        this.refreshOpts();
    }

    // Update opts with env and argv values
    refreshOpts () {
        let opts = this.opts;
        each([
            {
                key: 'dir',
                arg: 'config-dir',
                env: 'CONFIG_DIR'
            },
            {
                key: 'group',
                arg: 'config-group',
                env: 'CONFIG_GROUP'
            },
            {
                key: 'config',
                arg: 'config',
                env: 'CONFIG'
            },
            {
                key: 'id',
                arg: 'config-id',
                env: 'CONFIG_ID'
            },
            {
                key: 'env',
                arg: 'node-env',
                env: 'NODE_ENV'
            }
        ], arg => {
            if (opts.enableEnv) {
                if (notNil(env(arg.env))) {
                    opts[arg.key] = env(arg.env);
                }
            }
            if (opts.enableArgv) {
                if (notNil(argv[arg.arg])) {
                    opts[arg.key] = argv[arg.arg];
                }
            }
        });
        if (opts.setNodeEnv) {
            env('NODE_ENV', opts.env);
        }
    }

    hasChanged () {
        let opts = this.opts;
        let { dir, group, config, id, env } = opts;
        this.refreshOpts();
        if (dir !== opts.dir) {
            return true;
        }
        if (group !== opts.group) {
            return true;
        }
        if (config !== opts.config) {
            return true;
        }
        if (id !== opts.id) {
            return true;
        }
        if (env !== opts.env) {
            return true;
        }
        return false;
    }

    getFileList () {
        let { defaultFileName, group, config, id, exts, env } = this.opts;
        let ext = concat(exts).at(0);
        return mapNotNil([
            defaultFileName,
            env,
            group,
            config,
            id
        ], str => {
            if (!str.endsWith(ext)) {
                return str.concat(ext);
            }
            return str;
        });
    }

    async resolve () {
        let res = {};
        let { dir, exts } = this.opts;
        let list = this.getFileList();
        let files = await importOrRequireFiles(list, { dir, exts });
        // Note: Handle race condition if env is also loading async
        if (this.hasChanged()) {
            list = this.getFileList();
            files = await importOrRequireFiles(list, { dir, exts });
        }
        eachNotNil(files, ({ err, contents }) => {
            if (err) {
                this.handleError(err);
            } else {
                if (isModule(contents)) {
                    merge(res, contents.default);
                } else {
                    merge(res, contents);
                }
            }
        });
        return freeze(res);
    }

    resolveSync () {
        let res = {};
        let { dir, exts } = this.opts;
        let files = this.getFileList();
        files = requireFiles(files, { dir, exts });
        eachNotNil(files, ({ err, contents }) => {
            if (err) {
                this.handleError(err);
            } else {
                merge(res, contents);
            }
        });
        return freeze(res);
    }

    handleError (err) {
        if (err.code !== NotFoundError.code) {
            throw err;
        } else {
            if (this.opts.throw) {
                throw err;
            }
            if (this.opts.warn) {
                console.warn(err);
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
