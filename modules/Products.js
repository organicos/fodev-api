var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var Products = new Schema({

    name : { type: String, required: 'Informe o nome do produto!' },

    price: Number,
    
    prices: [{ type : Schema.Types.ObjectId, ref: 'Prices' }],
    
    cost: {type: Number},
    
    costs: [{ type : Schema.Types.ObjectId, ref: 'Prices', select: false }],
    
    dscr : String,

    img: { type: String, required: 'Informe a url da imagem!' },
    
    images: [{ type : Schema.Types.ObjectId, ref: 'Images' }],
    
    category : String,
    
    categories: [{ type : Schema.Types.ObjectId, ref: 'Categories', required: 'Informe ao menos uma categoria!' }],
    
    highlight : { type: Boolean, default: 0 },
    
    active : { type: Boolean, default: 0 },
    
    supplier: String,
    
    suppliers: [{ type : Schema.Types.ObjectId, ref: 'Suppliers', required: 'Informe ao menos um fornecedor!' }],
    
    season: String,

    clicks: { type: Number, default: 0 },
    
    updated: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Products', Products);


