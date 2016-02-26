var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Addresses = new Schema({
        
        user: { type : Schema.Types.ObjectId, ref: 'Users', required: "Não conseguimos identificar o usuário."},

        name : { type: String, trim: true },
        
        phone: { type: String },

        cep: { type: String },
        
        street: { type: String, required: 'Informe o endereço!' },
        
        number: { type: String, required: 'Informe o numero da casa!' },
        
        img: { type : Schema.Types.ObjectId, ref: 'Files' },
        
        complement: String,
        
        district: { type: String, required: 'Informe o bairro!' },
        
        city: { type : Schema.Types.ObjectId, ref: 'Cities', required: "Não conseguimos identificar a cidade."},
        
        ref: { type: String, required: 'Por favor, informe alguma referência!' },
        
        lastUse: { type: Date, default: Date.now },
        
        updated: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Addresses', Addresses);