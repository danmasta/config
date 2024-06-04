import { assert, expect, should } from 'chai';
import { env } from 'node:process';
import Config from '../lib/config.js';

env.CONFIG_DIR='./tests/config';
env.NODE_ENV='test';

const conf = await new Config().resolve();

beforeEach(() => {
    global.assert = assert;
    global.expect = expect;
    global.should = should();
    global.Config = Config;
    global.conf = conf;
    global.config = conf;
});
