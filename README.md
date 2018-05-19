# Config
Configuration helper for node apps

Features:
* Easy to use
* Load `.js`, or `.json` files
* Exports plain javascript objects
* Safe by default
* Config is immutable and constant
* Flexible configuration via environment variables or cmd args

## About
We needed a better way to configure node apps. Other config packages out there were either too complex or not flexible enough. This package aims to be the simplest, most flexible config initializer possible.

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

## Config Files
This package will attempt to load configuration files in the following order:
1. `./config/default`
2. `./config/(NODE_ENV)`
3. `./config/(CONFIG_GROUP)`
4. `./config/(CONFIG)`
5. `./config/(CONFIG_ID)`

Config files can be `.js` or `.json` and they should export a plain object. They should also be named to match the options variable they represent, ie: production.js for when `NODE_ENV=production` and development.js for when `NODE_ENV=development`, etc. If you had a `CONFIG_GROUP=eu` variable set, for example, then you would also want to have an eu.js file.
```javascript
module.exports = {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
};
```
*If multiple files are found, they are merged with the default configuration and values are over written. This means you only need to add properties that have changed between environments*

## Options
Env Variable | Cmd Arg | Description
-------------|---------|------------
`CONFIG_DIR` | config-dir | Directory where config files are located. Default is `./config`
`NODE_ENV` | env | Environment name to load base config for. Default is `development`
`CONFIG_GROUP` | config-group | Config or process group name. Default is `undefined`
`CONFIG` | config | Useful for further specifying config values. Default is `undefined`
`CONFIG_ID` | config-id | Useful for further specifying config values. Default is `undefined`

### CMD Args
You can pass config names as cmd arguments also and they will be set as environment variables *before* config files are loaded. This means you can do things like
```bash
node app --env production --config staging
```
This will load both the production config and then the staging config. This makes it super easy to run and/or test your app with different configs in multiple environments.

## Methods
Name | Description
-----|------------
`_merge()` | Accepts a single argument as an object or file path string. If argument is a file path, it will load the file from `config-dir` and merge the contents with our current config, overwritting existing values. This function returns a local, immutable, constant copy of config, it will not modify the default config exports.
`_defaults()` | Accepts a single argument as an object or file path string. If argument is a file path, it will load the file from `config-dir` and merge the contents with our current config, only adding values that resolve to undefined, it does not overwrite existing values. This function returns a local, immutable, constant copy of config, and will not modify the default config exports.
`_from(dir)` | Loads config files from specified directory. Returns a local, immutable, constant config object. Will not modify default config exports. Useful for package authors who want to load config relative to their module's root directory vs the user's current working directory.

## Safety
All objects exported from this package are immutable and constant by default. This means all own, inherited, and nested properties cannot be changed. Any attempt to assign or overwrite a property on the config object after export will silently fail.

If you need to extend the config object or add/change values, consider using the built in methods: `_defaults`, `_merge`, `_from`. These methods will create local copies of config that are also immutable.

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
```javascript
config.redis.host // '127.0.0.1' in development
config.redis.port // 6379
```
*Config exports a plain javascript object, so you can just use dot notation to access any nested value*

#### Load config from a specific directory
```javascript
const config = require('config')._from(__dirname + '/config');
```

#### Extend config with local values
```javascript
const config = require('config')._merge({
    redis: {
        host: 'localhost',
        port: 6379
    }
});
```

#### Extend config with local values if they are undefined
```javascript
const config = require('config')._defaults({
    redis: {
        host: 'localhost',
        port: 6379
    }
});
```

#### Extend config defaults with specified file contents
```javascript
const config = require('config')._defaults(__dirname + '/config/module');
```

## Contact
If you have any questions feel free to get in touch
