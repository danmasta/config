interface Defaults {
    enableArgv: boolean,
    enableEnv: boolean,
    setNodeEnv: boolean,
    dir: string,
    group: string,
    config: string,
    id: string,
    defaultFileName: string,
    warn: boolean,
    throw: boolean,
    ext: string|string[]
}

type Subset<T> = Partial<{
    [P in keyof T]: T[P] extends object ? Subset<T[P]> : T[P]
}>;

type FactoryFn = {
    (opts?: Subset<Defaults>): Config;
}

export class Config {
    constructor (opts?: Subset<Defaults>);
    opts: Defaults;
    refreshOpts (): void;
    getFileList (): string[];
    async resolve (): object;
    resolveSync (): object;
    async resolveFiles (): object[];
    resolveFilesSync (): object[];
    handleError (err: Error): void;
    static get defaults (): Defaults;
    static factory (...args?: unknown[]): FactoryFn;
}

declare const conf: Config.resolve;

export {
    conf as default, conf, conf as config, Config
};
