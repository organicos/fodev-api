var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
        name : {type: String, trim: true},
        email: {type: String, trim: true},
        password: {type: String, trim: true},
        kind: {type: String, default: 'customer'},
        token: String
});

module.exports = mongoose.model('users', Users);


