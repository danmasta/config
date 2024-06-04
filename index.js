import Config from './lib/config.js';

const conf = await new Config().resolve();

export {
    conf as default, conf, conf as config, Config
};
