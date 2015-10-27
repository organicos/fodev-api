var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Orders = mongoose.model('Orders', {
    name : { type: String, required: 'Informe o nome da cesta!' },
    total: { type: Number, required: 'Informe o total!' },
    products: { type: Array, required: 'A cesta está vazia!' },
    customer: { type: Object, required: 'Identifique o cliente!' },
    shipping: {
        price: { type: Number, required: 'Informe o preço do frete!' },
        cep: { type: String, required: 'Informe o cep!' },
        street: { type: String, required: 'Informe o endereço!' },
        number: { type: String, required: 'Informe o numero da casa!' },
        complement: String,
        district: { type: String, required: 'Informe o bairro!' },
        city: { type: String, required: 'Informe a cidade!' },
        state: { type: String, required: 'Informe o estado!' },
        country: { type: String, default: 'Brasil', required: 'Informe o país!' },
        address_ref: { type: String, required: 'Informe alguma referência!' },
        deliveryOption: { type: String },
        date: { type: String, required: 'Informe a data de entrega!' },
        phone: { type: String, required: 'Informe um telefone para contato!' }
    },
    pagseguro: {
        checkout: { type: Object, default: {}, required: 'Os dados de checkout do Pagseguro não foram informados!' },
        transactions: { type: Array, default: [] }
    },
    refound: {
        option: { type: String, default: ""}, // 'cash','discount','products'
        value: { type: Number, default: 0 },
        discount: { type : Schema.Types.ObjectId, ref: 'Discounts' },
        products: [{ type : Object }]
    },
    active : { type: Boolean, default: true },
    garbage_free : { type: Boolean, default: true },
    status : { type: Number, default: 0 }, // payment_status_map
    payment_date: { type: Date },
    updated: { type: Date, default: Date.now }
});
        
module.exports = mongoose.model('Orders', Orders);