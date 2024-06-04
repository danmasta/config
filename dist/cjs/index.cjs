var config = require('./lib/config.cjs');

const conf = new config().resolveSync();

module.exports = conf;
