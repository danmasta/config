# Config
Configuration helper for node apps

#### Features:
* Easy to use
* Load `.js`, `.json`, `.cjs`, or `.mjs` files
* Exports plain javascript objects
* Safe by default
* Exported config is immutable and constant
* Flexible configuration via environment variables or cmd args
* Helps prevent many config related bugs and vulnerabilities
* Native esm and cjs support
* 0 external dependencies

## About
I wanted a better way to configure node apps. Other config packages out there were either too complex or not flexible enough. This package aims to be the simplest, most flexible config initializer possible. This package exports config at run time as an immutable constant object that cannot be modified. It helps prevent an entire class of possible hard to track down bugs from code that might accidentally or intentionally overwrite config values during execution. It can also help prevent a whole class of potential vulnerabilities via environment hijack/overwritting from bad dependecies. You can import env variables into your config files at startup time via this package and they now become immutable.

## Usage
Add config as a dependency for your app and install via npm
```bash
npm install config@danmasta/config --save
```
Install a specific [version](https://github.com/danmasta/config/tags)
```bash
npm install config@danmasta/config#v5.2.0 --save
```

Import or require the package in your app
```js
import config from 'config';
```

Get values
```js
import redis from 'redis';
const client = redis.createClient(config.redis);
```

### Options
name | type | description
-----|------|------------
`enableArgv` | *`boolean`* | Whether or not to enable cli argv helper options. Default is `true`
`enableEnv` | *`boolean`* | Whether or not to enable environment variable helper options. Default is `true`
`setNodeEnv` | *`boolean`* | Whether or not to set the `NODE_ENV` environment variable if not already set. Default is `false`
`dir` | *`string`* | Directory to load configuration files from. Default is `./config`
`group` | *`string`* | Name of the config group file to load. This is a middle config file loaded in the chain. Default is `undefined`
`config` | *`string`* | Name of the config file to load. This is a middle config file loaded in the chain. Default is `undefined`
`id` | *`string`* | Name of the config ID to load. This is the last config file loaded so it's the most specific and will override all others in the chain. Default is `undefined`
`defaultFileName` | *`string`* | Name of the default configuration file to load. This is the first file loaded for everything. Default is `default`
`defaultNodeEnv` | *`string`* | Which env name to use if `setNodeEnv` is enabled. Default is `'development'`
`warn` | *`boolean`* | If true will write a message to `stderr` when a config file is not found. Default is `false`
`throw` | *`boolean`* | If true will throw an error when a config file is not found. Default is `false`
`exts` | *`string\|array`* | Which file extensions to use during file lookup. Default is `['.js', '.json', '.cjs', '.mjs']`
`env` | *`string`* | Name of the environment file to load. This is the second config file loaded in the chain. Default is `undefined`

### Methods
Name | Description
-----|------------
`resolve()` | Loads config asynchronously. Returns a promise that resolves with an immutable `object`
`resolveSync()` | Loads config synchronously. Returns an immutable `object`

### ENV / CMD options
Env Variable | Cmd Arg | Description
-------------|---------|------------
`CONFIG_DIR` | config-dir | Directory to load configuration files from. Default is `./config`
`CONFIG_GROUP` | config-group | Name of the config group file to load. This is a middle config file loaded in the chain. Default is `undefined`
`CONFIG` | config | Name of the config file to load. This is a middle config file loaded in the chain. Default is `undefined`
`CONFIG_ID` | config-id | Name of the config ID to load. This is the last config file loaded so it's the most specific and will override all others in the chain. Default is `undefined`
`NODE_ENV` | node-env | Name of the environment file to load. This is the second config file loaded in the chain. Default is `undefined`

#### Example
You can pass config names as cmd arguments or env variables and they will be set as environment variables *before* config files are loaded. This means you can do things like:
```bash
node app --config staging
```
```bash
NODE_ENV=ci CONFIG=staging node app
```
This will load both the default config and then the staging config. This makes it really easy to run and/or test your app with different configs in multiple environments

## Config Files
This package will attempt to load configuration files in the following order:
1. `./config/default`
2. `./config/(NODE_ENV)`
3. `./config/(CONFIG_GROUP)`
4. `./config/(CONFIG)`
5. `./config/(CONFIG_ID)`

Config files can be `.js`, `.json`, `.cjs`, or `.mjs` and they should export a plain object as default. They should also be named to match the options variable they represent, eg: `production.js` for `NODE_ENV=production` and `development.js` for `NODE_ENV=development`, etc. If you had a `CONFIG_GROUP=eu` variable set, for example, then you would also want to have an `eu.js` file.
```js
export default {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
};
```
*If multiple files are found, they are merged with the default configuration and values are over written. This means you only need to add properties that have changed between environments*

## Safety
All objects exported from this package are immutable and constant by default. This means all own, inherited, and nested properties cannot be changed. Any attempt to assign or overwrite a property on the config object after export will [*`fail silently`*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#description) or throw a `TypeError`

If you need to extend the config object or add/change values after initialization, you can create a new instance with your custom configuration, then call `resolve()` and export that to your application

## Examples
#### Set a property for two different environments
```js
// ./config/default.js
export default {
    redis: {
        host: 'redis.example.net',
        port: 6379
    }
};

// ./config/development.js
export default {
    redis: {
        host: '127.0.0.1'
    }
};
```

#### Get a property value
*Config exports a plain javascript object, so you can just use dot notation to access any nested value*
```js
config.redis.host // '127.0.0.1' in development
config.redis.port // 6379
```

#### Load config from a specific directory programatically
```js
import { Config } from 'config';

const config = new Config({
    dir: './test/config'
});

export default await config.resolve();
```

#### Use [env](https://github.com/danmasta/env) variables with config for extra flexibility
```js
import env from 'env';

// ./config/default.js
export default {
    redis: {
        host: env('REDIS_HOST'),
        port: env('REDIS_PORT')
    }
};
```
*You can now expose environment variables as native types and they become immutable as part of your config*

## Testing
Tests are currently run using mocha and chai. To execute tests run `make test`. To generate unit test coverage reports run `make coverage`

## Contact
If you have any questions feel free to get in touch
