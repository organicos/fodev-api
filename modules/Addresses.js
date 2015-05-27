var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Addresses = new Schema({

        name : { type: String, trim: true },

        cep: { type: String, required: 'Informe o cep!' },
        
        street: { type: String, required: 'Informe o endereço!' },
        
        number: { type: String, required: 'Informe o numero da casa!' },
        
        complement: String,
        
        district: { type: String, required: 'Informe o bairro!' },
        
        city: { type: String, required: 'Informe a cidade!' },
        
        state: { type: String, required: 'Informe o estado!' },
        
        country: { type: String, default: 'Brasil', required: 'Informe o país!' },
        
        address_ref: { type: String, required: 'Informe alguma referência!' },
        
        updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Addresses', Addresses);