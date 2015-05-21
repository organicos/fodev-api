var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var Products = new Schema({

    name : { type: String, required: 'Informe o nome do produto!' },
    
    encoded_url: { type: String, trim: true, required: 'Informe a url codificada!', unique: true }, // SLUG

    dscr : String,
    
    highlight : { type: Boolean, default: false },
    
    active : { type: Boolean, default: false },
    
    season: String,
    
    updated: { type: Date, default: Date.now },
    
    prices: { type: [{ type : Schema.Types.ObjectId, ref: 'Prices' }], default: []},
    
    costs: { type: [{ type : Schema.Types.ObjectId, ref: 'Prices' }], default: []},
    
    images: { type: [{ type : Schema.Types.ObjectId, ref: 'Images' }], default: []},
    
    categories: { type: [{ type : Schema.Types.ObjectId, ref: 'Categories'}], default: [], required: 'Informe ao menos uma categoria!' },
    
    suppliers: { type: [{ type : Schema.Types.ObjectId, ref: 'Suppliers'}], default: [] },
    
    visits: { type: [{ type : Schema.Types.ObjectId, ref: 'Visits' }], default: []}

});

module.exports = mongoose.model('Products', Products);


