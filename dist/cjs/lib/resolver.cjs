var lo = require('@danmasta/lo');

const defs = {
    dir: undefined,
    files: undefined,
    ext: undefined
};

class FileResolver {

    constructor (opts) {
        this.opts = opts = lo.defaults(opts, defs);
    }

    refresh (opts) {
        this.opts = lo.defaults(opts, this.opts, defs);
    }

    // Returns a list of file objects
    async resolve () {
        let { files, dir, ext } = this.opts;
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

    // Returns a list of file objects synchronously
    resolveSync () {
        let { files, dir, ext } = this.opts;
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

    static get defaults () {
        return defs;
    }

}

module.exports = FileResolver;
