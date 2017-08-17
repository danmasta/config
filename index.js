const path = require('path');
const _ = require('lodash');
const env = require('@danmasta/env');

const config = {};

function init(){

    ['default', env('NODE_ENV') || 'development'].map(file => {

        try {

            _.merge(config, require(path.resolve(`./config/${file}`)));

        } catch(err) {

            if(env('DEBUG')){
                console.log(`Config: ${err.message}`);
            }

        }

    });

};

init();

module.exports = config;
