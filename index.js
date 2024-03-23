const Config = require('./lib/config');

const config = new Config({
    enableArgv: true,
    enableEnv: true
});

module.exports = config.resolve();
