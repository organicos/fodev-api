var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Prices = mongoose.model('Prices', {
    price: { type: Number, required: 'Informe o preço' }
    , date: { type: Date, default: Date.now }
});
        
module.exports = mongoose.model('Prices', Prices);