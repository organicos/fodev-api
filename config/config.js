"use strict";

var config = {
    env: 'dev'
};

config.database = {
    host: 'x.x.x.x'
};

config.pagseguro = {
    host: 'https://ws.pagseguro.uol.com.br/v2',
    email: 'xxx@xxx.xxx',
    token: 'xxxxxxx'
};

config.APP_PRIVATE_KEY = 'xxxxx'; // a private key to use across the app

module.exports = config;