var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Countries = new Schema({

    name : { type: String, trim: true, required: 'Informe um nome para o país.' },
    
    active : { type: Boolean, default: true },
    
    code : { type: String, trim: true, required: 'Informe o código do país. Ex.: BRA para Brasil' },
    
    updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Countries', Countries);