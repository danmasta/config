import Config from './lib/config.js';

const mod = new Config({
    enableEnv: true,
    enableArgv: true
});

const config = await mod.resolveConditional();

export {
    config as default, config, Config
};
