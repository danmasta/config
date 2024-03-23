# Config
Configuration helper for node apps

Features:
* Easy to use
* Load `.js`, `.json`, `.cjs`, or `.mjs` files
* Exports plain javascript objects
* Safe by default
* Exported config is immutable and constant
* Flexible configuration via environment variables or cmd args
* Helps prevent many config related bugs and vulnerabilities

## About
We needed a better way to configure node apps. Other config packages out there were either too complex or not flexible enough. This package aims to be the simplest, most flexible config initializer possible. This package also exports config at run time as an immutable constant object that cannot be modified. It helps prevent an entire class of possible hard to track down bugs from code that might accidentally or intentionally overwrite config values during execution. It can also help prevent a whole class of potential vulnerabilities via environment hijack/overwritting from bad dependecies. You can import env variables into your config files at startup time via this package and they now become immutable.

## Usage
Add config as a dependency for your app and install via npm
```bash
npm install @danmasta/config --save
```

Require the package in your app
```javascript
const config = require('@danmasta/config');
```

Get values
```javascript
const redis = require('redis');
const client = redis.createClient(config.redis);
```

### Config Files
This package will attempt to load configuration files in the following order:
1. `./config/default`
2. `./config/(NODE_ENV)`
3. `./config/(CONFIG_GROUP)`
4. `./config/(CONFIG)`
5. `./config/(CONFIG_ID)`

Config files can be `.js`, `.json`, `.cjs`, or `.mjs` and they should export a plain object as default. They should also be named to match the options variable they represent, eg: `production.js` for `NODE_ENV=production` and `development.js` for `NODE_ENV=development`, etc. If you had a `CONFIG_GROUP=eu` variable set, for example, then you would also want to have an `eu.js` file.
```javascript
module.exports = {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
};
```
*If multiple files are found, they are merged with the default configuration and values are over written. This means you only need to add properties that have changed between environments*

### Env Variable/ CMD Options
Env Variable | Cmd Arg | Description
-------------|---------|------------
`CONFIG_DIR` | config-dir | Directory where config files are located. Default is `./config`
`CONFIG_GROUP` | config-group | Config or process group name. Default is `undefined`
`CONFIG` | config | Useful for further specifying config values. Default is `undefined`
`CONFIG_ID` | config-id | Useful for further specifying config values. Default is `undefined`

#### Example
You can pass config names as cmd arguments or env variables and they will be set as environment variables *before* config files are loaded. This means you can do things like:
```bash
node app --config staging
```
```bash
NODE_ENV=ci,CONFIG=staging node app
```
This will load both the default config and then the staging config. This makes it super easy to run and/or test your app with different configs in multiple environments

### Methods
Name | Description
-----|------------
`env(key, val?)` | Simple getter/setter for interacting with environment variables
`argv(key)` | Simple getter function for argv variables
`resolveAsyncConditional(async)` | Loads config in a conditionally async manner. Returns a promise if any file requires `import` or async is set to `true`, otherwise a synchronous object. Useful for esm projects where import can be [conditionally async](https://github.com/nodejs/node/pull/51977)
`resolveAsync()` | Loads config asynchronously. Returns a promise that resolves with an immutable object
`resolve()` | Loads config synchronously. Returns an immutable object
`load()` | Alias for `resolve()`

### Options
name | type | description
-----|------|------------
`enableArgv` | *`boolean`* | Whether or not to enable cli argv helper options. Default is `false`
`enableEnv` | *`boolean`* | Whether or not to enable environment variable helper options. Default is `false`
`setNodeEnv` | *`boolean`* | Whether or not to set the `NODE_ENV` environment variable if not set already. Default is `false`
`configDir` | *`string`* | Directory to load configuration files from. Default is `./config`
`configGroup` | *`string`* | Name of the config group file to load. This is a middle config file loaded in the chain. Default is `undefined`
`config` | *`string`* | Name of the config file to load. This is a middle config file loaded in the chain. Default is `undefined`
`configId` | *`string`* | Name of the config ID to load. This is the last config file loaded so it's the most specific and will override all others in the chain. Default is `undefined`
`defaultConfigFileName` | *`string`* | Name of the default configuration file to load. This is the first file loaded for everything. Default is `default`
`warn` | *`boolean`* | If true will write a message to `stderr` when a config file is not found. Default is `false`
`throw` | *`boolean`* | If true will throw an error when a config file is not found. Default is `false`


## Safety
All objects exported from this package are immutable and constant by default. This means all own, inherited, and nested properties cannot be changed. Any attempt to assign or overwrite a property on the config object after export will [*`silently fail`*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#description)

If you need to extend the config object or add/change values after initialization, you will have to create a new instance with your custom configuration and then call `load()` or `resolve()` and export that to your application

## Examples
#### Set a property for two different environments
```javascript
// ./config/default.js
module.exports = {
    redis: {
        host: 'redis.example.com',
        port: 6379
    }
};

// ./config/development.js
module.exports = {
    redis: {
        host: '127.0.0.1'
    }
};
```

#### Get a property value
*Config exports a plain javascript object, so you can just use dot notation to access any nested value*
```javascript
config.redis.host // '127.0.0.1' in development
config.redis.port // 6379
```

#### Load config from a specific directory programatically
```javascript
const Config = require('@danmasta/config/lib/config');

const config = new Config({
    configDir: '/test/config'
});

module.exports = config.resolve();
```

#### ESM
If using with esm you can just export your configs as default
```js
// ./config/default.js
export default {
    redis: {
        host: 'redis.example.com',
        port: 6379
    }
};
```

#### Use env variables with config for ultimate flexibility
```js
const env = require('@danmasta/env');

// ./config/default.js
module.exports = {
    redis: {
        host: env('REDIS_HOST'),
        port: env('REDIS_PORT')
    }
};
```
*You can now expose environment variables as native types and they become immutable as part of your config*

## Contact
If you have any questions feel free to get in touch
