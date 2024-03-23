import Config from './lib/config.js';

const config = await new Config({
    enableArgv: true,
    enableEnv: true
}).resolveAsyncConditional();

export {
    config as default, config, Config
}
