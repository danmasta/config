export interface ConfigDefaults {
    enableArgv: boolean,
    enableEnv: boolean,
    setNodeEnv: boolean,
    configDir: string,
    configGroup: string,
    config: string,
    configId: string,
    defaultConfigFileName: string,
    warn: boolean,
    throw: boolean
}

type Subset<T> = Partial<{
    [P in keyof T]: T[P] extends object ? Subset<T[P]> : T[P]
}>;

export class Config {
    constructor (opts?: Subset<ConfigDefaults>);
    _opts: ConfigDefaults;
    env (key: string, val?: any): any;
    argv (key: string): string | undefined;
    static deepFreeze (obj: object, cache: Map): object;
    static isUndefined (val: any): boolean;
    loadFromFile (file: string): object;
    loadFromDir (dir: string): object;
    load (): object;
    resolve (): object;
}

declare const _config: Config;
export default _config.resolve;
