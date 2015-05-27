var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Groups = new Schema({
        name : {type: String, trim: true},
        updated: {type: Date, default: Date.now}
});