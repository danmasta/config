const env = require('@danmasta/env');
const path = require('path');
const _ = require('lodash');
const minimist = require('minimist');

const config = {};

// get cmd args
const argv = minimist(process.argv.slice(2));

function init(){

    // set config env variables if cmd args exist
    env('CONFIG_GROUP', argv['config-group']);
    env('CONFIG', argv['config']);
    env('CONFIG_ID', argv['config-id']);

    // attempt to load config files, in order
    ['default', env('NODE_ENV'), env('CONFIG_GROUP'), env('CONFIG'), env('CONFIG_ID')].map(file => {

        try {

            if(file){
                _.merge(config, require(path.resolve(`./config/${file}`)));
            }

        } catch(err) {

            if(env('DEBUG')){
                console.log(`Config: ${err.message}`);
            }

        }

    });

};

init();

module.exports = config;
