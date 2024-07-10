var lo = require('@danmasta/lo');
var errors = require('@danmasta/lo/errors');
var minimist = require('minimist');

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
    defaultNodeEnv: 'development',
    warn: false,
    throw: false,
    exts: ['.js', '.json', '.cjs', '.mjs']
};

class Config {

    constructor (opts) {
        this.opts = opts = lo.defaults(opts, defs);
        if (opts.setNodeEnv) {
            lo.env('NODE_ENV', opts.defaultNodeEnv);
        }
        this.refreshOpts();
    }

    // Update opts with env and argv values
    refreshOpts () {
        let opts = this.opts;
        let args = [
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
            }
        ];
        lo.each(args, arg => {
            if (opts.enableEnv) {
                if (lo.notNil(lo.env(arg.env))) {
                    opts[arg.key] = lo.env(arg.env);
                }
            }
            if (opts.enableArgv) {
                if (lo.notNil(argv[arg.arg])) {
                    opts[arg.key] = argv[arg.arg];
                }
            }
        });
    }

    getFileList () {
        let { defaultFileName, group, config, id, exts } = this.opts;
        let ext = lo.concat(exts).at(0);
        return lo.mapNotNil([
            defaultFileName,
            lo.env('NODE_ENV'),
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
        let files = this.getFileList();
        files = await lo.importOrRequireFiles(files, { dir, exts });
        lo.eachNotNil(files, ({ err, contents }) => {
            if (err) {
                this.handleError(err);
            } else {
                if (lo.isModule(contents)) {
                    lo.merge(res, contents.default);
                } else {
                    lo.merge(res, contents);
                }
            }
        });
        return lo.freeze(res);
    }

    resolveSync () {
        let res = {};
        let { dir, exts } = this.opts;
        let files = this.getFileList();
        files = lo.requireFiles(files, { dir, exts });
        lo.eachNotNil(files, ({ err, contents }) => {
            if (err) {
                this.handleError(err);
            } else {
                lo.merge(res, contents);
            }
        });
        return lo.freeze(res);
    }

    handleError (err) {
        if (err.code !== errors.NotFoundError.code) {
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

module.exports = Config;
