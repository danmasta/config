# Config
Configuration helper for node apps

Features:
* Easy to use
* Load `.js`, or `.json` files
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

## Config Files
This package will attempt to load configuration files in the following order:
1. `./config/default`
2. `./config/(NODE_ENV)`
3. `./config/(CONFIG_GROUP)`
4. `./config/(CONFIG)`
5. `./config/(CONFIG_ID)`

Config files can be `.js` or `.json` and they should export a plain object. They should also be named to match the options variable they represent, eg: `production.js` for `NODE_ENV=production` and `development.js` for `NODE_ENV=development`, etc. If you had a `CONFIG_GROUP=eu` variable set, for example, then you would also want to have an `eu.js` file.
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
`CONFIG_GROUP` | config-group | Config or process group name. Default is `undefined`
`CONFIG` | config | Useful for further specifying config values. Default is `undefined`
`CONFIG_ID` | config-id | Useful for further specifying config values. Default is `undefined`

### CMD Args
You can pass config names as cmd arguments also and they will be set as environment variables *before* config files are loaded. This means you can do things like
```bash
node app --config staging
```
This will load both the default config and then the staging config. This makes it super easy to run and/or test your app with different configs in multiple environments

## Methods
Name | Description
-----|------------
`env(key, val?)` | Simple getter/setter for interacting with environment variables
`argv(key)` | Simple getter function for argv variables
`deepFreeze(obj)` | Recursively freezes an object to make it immutable
`isUndefined(obj)` | Checks if a value is `undefined` or `'undefined'`
`loadFromFile(str)` | Loads data from a file path resolved from `process.cwd`, returns a regular mutable object
`loadFromDir(str)` | Loads data from a directory in a heirarchical order based on class instance settings, returns an immutable object
`load()` | Loads data from a directory based on settings, returns an immutable object
`resolve()` | Loads data from a directory based on settings, returns an immutable object

## Safety
All objects exported from this package are immutable and constant by default. This means all own, inherited, and nested properties cannot be changed. Any attempt to assign or overwrite a property on the config object after export will *`silently fail`*

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

## Contact
If you have any questions feel free to get in touch
