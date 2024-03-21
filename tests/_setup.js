const path = require('path');

process.env.CONFIG_DIR = path.join(__dirname, 'config');
process.env.NODE_ENV = 'test';

const Config = require('../lib/config');
const config = require('../index');

beforeEach(() => {
    return import('chai').then(chai => {
        global.assert = chai.assert;
        global.expect = chai.expect;
        global.should = chai.should();
        global.Config = Config;
        global.config = config;
        global.path = path;
    });
});
