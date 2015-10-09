var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Discounts = new Schema({

    customer: { type: Object, required: 'Identifique o cliente!' },
    
    value: { type: Number, required: 'Informe o valor do desconto!' },
    
    desc : { type: String, trim: true, required: 'Informe o motivo do desconto!' },
    
    startDate: { type: Date, required: 'Informe a data de inicio da validade do desconto!' },
    
    endDate: { type: Date, required: 'Informe a data do fim da validade do desconto!' },

    updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Discounts', Discounts);