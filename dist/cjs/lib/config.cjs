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
        let { defaultFileName, group, config, id, ext } = this.opts;
        ext = lo.concat(ext).at(0);
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
        let conf = {};
        let files = await this.resolveFiles();
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
        let files = this.resolveFilesSync();
        lo.eachNotNil(files, file => {
            if (file.error) {
                this.handleError(file.error);
            } else {
                lo.merge(conf, file.contents);
            }
        });
        return lo.freeze(conf);
    }

    async resolveFiles () {
        let { dir, ext } = this.opts;
        let files = this.getFileList();
        return await lo.mapNotNil(files, async str => {
            let file, contents, error;
            try {
                file = await lo.resolvePathIfExists(str, { dir, ext });
                contents = await lo.importOrRequire(file);
            } catch (err) {
                error = err;
            }
            return {
                path: file,
                original: str,
                contents,
                error
            }
        });
    }

    resolveFilesSync () {
        let { dir, ext } = this.opts;
        let files = this.getFileList();
        return lo.mapNotNil(files, str => {
            let file, contents, error;
            try {
                file = lo.resolvePathIfExistsSync(str, { dir, ext });
                contents = lo.require(file);
            } catch (err) {
                error = err;
            }
            return {
                path: file,
                original: str,
                contents,
                error
            }
        });
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
