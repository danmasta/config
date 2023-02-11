const Config = require('./lib/config');

const config = new Config({
    enableEnv: true,
    enableArgv: true
});

exports = module.exports = config.resolve();
