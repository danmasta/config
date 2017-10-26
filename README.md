# Config
Configuration helper for node apps

Features:
* Easy to use
* Load `.js`, or `.json` files
* Exports plain javascript object
* Supports config for multiple environments and configurations

## About
We needed a better way to configure node apps. I used this [config](https://github.com/lorenwest/node-config) package for a long time, but got tired of all the error messages and warnings showing up in my server logs. I also think it provides too many features that are not needed, at least for my use case. This package attempts to be the simplest most straight forward config initializer possible.

## Usage
Add config as a dependency for your app and install via npm
```bash
npm install @danmasta/config --save
```

Require the package in your app
```javascript
const config = require('@danmasta/config');
```

## Config Files
This package will attempt to load configuration files in the following order:
1. `./config/default`
2. `./config/(NODE_ENV)`
3. `./config/(CONFIG_GROUP)`
4. `./config/(CONFIG)`
5. `./config/(CONFIG_ID)`

Config files can be `.js` or `.json` and they should export a plain object. They should also be named to match the `NODE_ENV` variable (production.js for production, development.js for dev, etc)
```javascript
module.exports = {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
};
```
*If multiple files are found, they are merged in with the default configuration and values are over written. This means you only need to add properties that have changed between environments*

## CMD Args
You can pass config names as cmd arguments also and they will be set as environment variables *before* config files are loaded. This means you can do things like
```bash
node app --env production --config staging
```
This will load both the production config and then the staging config. This makes it super easy to run and/or test your app with different configs in multiple environments.

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

## Contact
If you have any questions feel free to get in touch:

Name | Role | Email
-----|------|------
Daniel Smith | Engineer | dannmasta@gmail.com
