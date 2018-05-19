// change process.cwd so we can load test default config
process.chdir('./tests');

// deps
const chai = require('chai');
const config = require('../index');
const path = require('path');

beforeEach(() => {
    global.assert = chai.assert;
    global.expect = chai.expect;
    global.should = chai.should();
    global.config = config;
    global.path = path;
});
