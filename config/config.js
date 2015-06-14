"use strict";

var config = {};

config.env = 'env_name';

config.envTag = 'env_tag_to_prefix_email_subject';

config.database = {
    host: 'localhost/databasename'
};

config.pagseguro = {
    host: 'https://ws.sandbox.pagseguro.uol.com.br',
    email: 'sssn@sss.com',
    token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
};

config.mandrill = {
    apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
}

config.mail = {
    from: 'Company name <foo@bar.com>'
    , replyTo: "foo@bar.com"
}

config.s3 = {
    host: 'https://s3-sa-east-1.amazonaws.com'
    , bucket: 'xxxx'
    , accessKeyID: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    , secretAccessKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
}

config.APP_PRIVATE_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // a private key to use across the app

module.exports = config;