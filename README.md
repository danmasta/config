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
3. `./config/(CONFIG_ID)`

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

## Best Practices
This package is designed to simplify the changing configurations between multiple server environments. Imagine you have multiple application environments like so: `development`, `qa1`, `qa2`, `qa3`, `staging`, and `production`. You might only have a few variables that actually change between the environments, but you abstract everything as environment variables anyway, just to be consistent. This can be really confusing and time consuming to manage. It also is not checked in to source control, so becomes very easy to break something or delete a needed value forever, on accident.

With this method you only ever need to set one (maybe two) environment variables: `NODE_ENV` and `CONFIG_ID`. With just those two variables, you can create any number of configuration profiles and help keep your servers/ containers as portable as possible. This also helps prepare for things like remote config, which I'll add more info on in the future.

example:
```bash
NODE_ENV=production
CONFIG_ID=qa1
```

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
