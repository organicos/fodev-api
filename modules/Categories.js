var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Categories = new Schema({

    name : { type: String, trim: true, required: 'Informe um nome para a categoria.' },

    updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Categories', Categories);