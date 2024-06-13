import { concat, defaults, each, eachNotNil, env, freeze, importOrRequire, isModule, mapNotNil, merge, notNil, require, resolvePathIfExists, resolvePathIfExistsSync } from '@danmasta/lo';
import { NotFoundError } from '@danmasta/lo/errors';
import minimist from 'minimist';

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
        each(args, arg => {
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
    }

    getFileList () {
        let { defaultFileName, group, config, id, ext } = this.opts;
        ext = concat(ext).at(0);
        return mapNotNil([
            defaultFileName,
            env('NODE_ENV'),
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
        let files = this.resolveFilesSync();
        eachNotNil(files, file => {
            if (file.error) {
                this.handleError(file.error);
            } else {
                merge(conf, file.contents);
            }
        });
        return freeze(conf);
    }

    async resolveFiles () {
        let { dir, ext } = this.opts;
        let files = this.getFileList();
        return await mapNotNil(files, async str => {
            let file, contents, error;
            try {
                file = await resolvePathIfExists(str, { dir, ext });
                contents = await importOrRequire(file);
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
        return mapNotNil(files, str => {
            let file, contents, error;
            try {
                file = resolvePathIfExistsSync(str, { dir, ext });
                contents = require(file);
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
