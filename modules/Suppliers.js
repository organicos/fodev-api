var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Suppliers = new Schema({

    name : { type: String, trim: true, required: 'Informe o nome do fornecedor.' },
    
    desc : { type: String, trim: true },

    phone : { type: String, trim: true },
    
    email : { type: String, trim: true },
    
    orderRules : { type: String, trim: true },

    address : { type : Schema.Types.ObjectId, ref: 'Addresses' },
    
    images: [{ type : Schema.Types.ObjectId, ref: 'Files' }],
    
    products : [{ type : Schema.Types.ObjectId, ref: 'Products' }],

    updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Suppliers', Suppliers);