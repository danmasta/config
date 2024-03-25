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
    throw: boolean
}

interface FileResolverDefaults {
    encoding: string,
    dir: string,
    files: string|string[]
}

type Subset<T> = Partial<{
    [P in keyof T]: T[P] extends object ? Subset<T[P]> : T[P]
}>;

type FactoryFn = {
    (opts?: Subset<Defaults>): Config;
}

declare class FileResolver {
    constructor (opts?: Subset<FileResolverDefaults>);
    opts: FileResolverDefaults;
    refresh (opts?: Subset<FileResolverDefaults>): void;
    resolvePath (str: string): string;
    resolvePathIfExists (str: string): string;
    requireImportOrRead (str: str): Promise<object>|object;
    resolveConditional (async?: boolean): Promise<object[]>|object[];
    resolve (): object[];
    resolveAsync (): Promise<object[]>;
    getFileList (): object[];
    formatSettledFiles (arr: object[]): object[];
    static get defaults (): FileResolverDefaults;
}

export class Config {
    constructor (opts?: Subset<Defaults>);
    opts: Defaults;
    resolver: FileResolver;
    getRefreshOpts (): object;
    refreshResolver (): void;
    resolveConditional (async?: boolean): Promise<object>|object;
    resolve (): object;
    resolveAsync (): Promise<object>;
    handleError (err: Error): void;
    static get defaults (): Defaults;
    static factory (...args?: unknown[]): FactoryFn;
}

export const config: Config;

export default config.resolveConditional();
