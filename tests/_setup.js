import { assert, expect, should } from 'chai';
import { env } from 'node:process';
import Config from '../lib/config.js';

env.NODE_ENV='test';
env.CONFIG_DIR='./tests/config';

const conf = await new Config({ exts: '.js' }).resolve();
const sync = new Config({ exts: '.cjs' }).resolveSync();

beforeEach(() => {
    global.assert = assert;
    global.expect = expect;
    global.should = should();
    global.Config = Config;
    global.conf = conf;
    global.config = conf;
    global.sync = sync;
});
