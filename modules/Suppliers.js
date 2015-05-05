var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Suppliers = new Schema({

    name : { type: String, trim: true, required: 'Informe o nome do fornecedor.' },
    
    contacts : { type: String, trim: true },
    
    images: [{ type : Schema.Types.ObjectId, ref: 'Images' }],
    
    addresses : [{ type : Schema.Types.ObjectId, ref: 'Addresses' }],

    updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Suppliers', Suppliers);