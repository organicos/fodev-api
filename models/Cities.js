var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Cities = new Schema({

    name : { type: String, trim: true, required: 'Informe um nome para a categoria.' },
    
    state: { type : Schema.Types.ObjectId, ref: 'States' },
    
    shipping_price : { type: Number, trim: true, required: 'Informe o valor do frete para esta cidade.' },
    
    active : { type: Boolean, default: true },

    updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Cities', Cities);