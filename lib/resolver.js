import { defaults, importOrRequire, mapNotNil, require, resolvePathIfExists, resolvePathIfExistsSync } from '@danmasta/lo';

const defs = {
    dir: undefined,
    files: undefined,
    ext: undefined
};

export default class FileResolver {

    constructor (opts) {
        this.opts = opts = defaults(opts, defs);
    }

    refresh (opts) {
        this.opts = defaults(opts, this.opts, defs);
    }

    // Returns a list of file objects
    async resolve () {
        let { files, dir, ext } = this.opts;
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

    // Returns a list of file objects synchronously
    resolveSync () {
        let { files, dir, ext } = this.opts;
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

    static get defaults () {
        return defs;
    }

}
