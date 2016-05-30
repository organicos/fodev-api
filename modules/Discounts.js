var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Discounts = new Schema({

    name : { type: String, trim: true },

    value : { type: Number, default: 0, required: 'Informe o valor do desconto!' },

    use_date : Date,

    date : { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Discounts', Discounts);      