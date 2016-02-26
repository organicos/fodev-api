var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Discounts = new Schema({

    customer: { type : Schema.Types.ObjectId, ref: 'Users', required: 'Identifique o cliente que receberá o desconto!' },

    order: { type : Schema.Types.ObjectId, ref: 'Orders' },
    
    value: { type: Number, required: 'Informe o valor do desconto!' },
    
    used: Date,
    
    desc : { type: String, trim: true, required: 'Informe o motivo do desconto!' },
    
    startDate: { type: Date, required: 'Informe a data de inicio da validade do desconto!' },
    
    endDate: { type: Date, required: 'Informe a data do fim da validade do desconto!' },

    updated: { type: Date, default: Date.now }

});

Discounts.statics.createNewDiscount = function(order, callback){

    var discount = {
        customer: order.customer,
        value: order.refound.value,
        desc: 'Reembolso por falta de produto',
        order: order,
        startDate: moment(),
        endDate: moment().add(1, 'year')

    };

    Discounts.create(discount, function(err, newDiscount) {

        callback(newDiscount);

    });

};

module.exports = mongoose.model('Discounts', Discounts);