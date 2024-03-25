const Config = require('./lib/config');

const config = new Config({
    enableEnv: true,
    enableArgv: true
});

module.exports = config.resolve();
