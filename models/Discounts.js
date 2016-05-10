var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var discountKindsMap = [
    "absolute",
    "percentage"
];

var Discounts = new Schema({

    customer: { type : Schema.Types.ObjectId, ref: 'Users', required: 'Identifique o cliente que receberá o desconto!' },

    order: { type : Schema.Types.ObjectId, ref: 'Orders' },
    
    value: { type: Number, required: 'Informe o valor do desconto!' },
    
    value_kind: { type : String, validate: { validator: validateDiscountKind, message: 'Tipo de desconto inválido.'} },
    
    used: Date,
    
    used_by: { type : Schema.Types.ObjectId, ref: 'Orders' },
    
    desc : { type: String, trim: true, required: 'Informe o motivo do desconto!' },
    
    validFrom: { type: Date, required: 'Informe a data de inicio da validade do desconto!' },
    
    validTo: { type: Date, required: 'Informe a data do fim da validade do desconto!' },

}, { timestamps: true } );

function validateDiscountKind(kind){

    var kindIndex = discountKindsMap.indexOf(kind);

    return kindIndex >= 0;

};

Discounts.statics.createNewDiscount = function(order, callback){
    
    var validTo = new Date();
    validTo.setYear(validTo.getYear()+1);

    var discount = {
        customer: order.customer,
        value: order.refound.value,
        desc: 'Reembolso por falta de produto',
        order: order,
        validFrom: Date.now,
        validTo: validTo

    };        
        
    Discounts.create(discount, function(err, newDiscount) {

        callback(newDiscount);

    });

};

module.exports = mongoose.model('Discounts', Discounts);