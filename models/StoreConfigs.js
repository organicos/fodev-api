var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Constants
var deliveryWeekDays = [
    false, // sunday
    false, // monday
    false, // tuesday
    false, // wednsday
    false, // thrusday
    false, // friday
    true // saturday
];

// Class Schema
var StoreConfigsSchema = new Schema({
    name: { type: String, required: 'Informe um nome para a sua loja.' },
    slogan: { type: String, required: 'Informe um slogan para a sua loja.' },
    address: { type : Schema.Types.ObjectId, ref: 'Addresses', required: "Informe o endereço da sua loja."},
    phone: { type: String, required: 'Informe um ou mais telefones de contato da sua loja.' },
    deliveryWeekDays: deliveryWeekDays,
    pagseguro: {
        host: { type: String, default: 'https://ws.pagseguro.uol.com.br' },
        email: { type: String, required: 'Informe o e-mail da sua conta no Pagseguro.' },
        token: { type: String, required: 'Informe o token da sua conta no Pagseguro.' }
    },
    pagseguroSandbox: {
        host: { type: String, default: 'https://ws.pagseguro.uol.com.br' },
        email: { type: String, required: 'Informe o e-mail da sua conta no Sandbox do Pagseguro.' },
        token: { type: String, required: 'Informe o token da sua conta no Sandbox do Pagseguro.' }
    },
    mandrill: {
        apiKey: { type: String, required: 'Informe a API Key da sua conta no Mandrill App.' },
    },
    mandrillSandbox: {
        apiKey: { type: String, required: 'Informe a API Key da sua conta no Sandbox do Mandrill App.' },
    },
    mail: {
        from: { type: String, required: 'Informe o e-mail a ser utilizado como remetente das notificações (De:).' },
        fromAlias: { type: String },
        replyTo: { type: String, required: 'Informe o e-mail a ser utilizado nas respostas das notificações (Responder para:).' },
    },
    s3: {
        host: { type: String, required: 'Informe o host do seu bucket S3.' },
        bucket: { type: String, required: 'Informe o nome do seu bucket S3.' },
        accessKeyID: { type: String, required: 'Informe o ID da Chave de Acesso do seu bucket S3.' },
        secretAccessKey: { type: String, required: 'Informe a Chave de Acesso do seu bucket S3.' },
    },
    minimumOrderTotal: {type: Number, default: 1}

});

// Class Model
var StoreConfigs = mongoose.model('StoreConfigs', StoreConfigsSchema);

module.exports = StoreConfigs;