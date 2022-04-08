declare namespace config {

    export function _merge (obj: object | string): object;
    export function _defaults (obj: object | string): object;
    export function _from (dir: string): object;

    export namespace config {
        export function _merge (obj: object | string): object;
        export function _defaults (obj: object | string): object;
        export function _from (dir: string): object;
    }

}

export = config;
