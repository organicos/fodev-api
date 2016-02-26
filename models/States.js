var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var States = new Schema({

    name : { type: String, trim: true, required: 'Informe o nome do estado.' },
    
    code : { type: String, trim: true, required: 'Informe o código do estado.' },
    
    country: { type : Schema.Types.ObjectId, ref: 'Countries', required: "Informe o país ao qual este estado pertence." },
    
    updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('States', States);