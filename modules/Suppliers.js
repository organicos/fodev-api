var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Suppliers = new Schema({

    name : { type: String, trim: true, required: 'Informe o nome do fornecedor.' },
    
    contacts : { type: String, trim: true },
    
    img: { type : Schema.Types.ObjectId, ref: 'Files' },
    
    images: [{ type : Schema.Types.ObjectId, ref: 'Files' }],
    
    addresses : [{ type : Schema.Types.ObjectId, ref: 'Addresses' }],

    updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Suppliers', Suppliers);