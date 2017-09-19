const path = require('path');
const _ = require('lodash');
const env = require('@danmasta/env');

const config = {};

function init(){

    // attempt to load config files, in order
    ['default', env('NODE_ENV'), env('CONFIG_GROUP'), env('CONFIG_ID')].map(file => {

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
