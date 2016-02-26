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
    name: { type: String, required: 'Por favor, informe um nome para a sua loja.' },
    slogan: { type: String, required: 'Por favor, informe um slogan para a sua loja.' },
    address: { type : Schema.Types.ObjectId, ref: 'Addresses', required: "Informe o endereço da sua loja."},
    phone: { type: String, required: 'Por favor, informe um ou mais telefones de contato da sua loja.' },
    deliveryWeekDays: deliveryWeekDays,
    apis: {
        pagseguro: {
            host: { type: String, default: 'https://ws.pagseguro.uol.com.br' },
            email: { type: String, required: 'Por favor, informe o e-mail da sua conta no Pagseguro.' },
            token: { type: String, required: 'Por favor, informe o token da sua conta no Pagseguro.' }
        },
        pagseguroSandbox: {
            host: { type: String, default: 'https://ws.pagseguro.uol.com.br' },
            email: { type: String, required: 'Por favor, informe o e-mail da sua conta no Sandbox do Pagseguro.' },
            token: { type: String, required: 'Por favor, informe o token da sua conta no Sandbox do Pagseguro.' }
        },
        mandrill: {
            apiKey: { type: String, required: 'Por favor, informe a API Key da sua conta no Mandrill App.' },
        },
        mandrillSandbox: {
            apiKey: { type: String, required: 'Por favor, informe a API Key da sua conta no Sandbox do Mandrill App.' },
        },
        mail: {
            from: { type: String, required: 'Por favor, informe o e-mail a ser utilizado como remetente das notificações (De:).' },
            fromAlias: { type: String },
            replyTo: { type: String, required: 'Por favor, informe o e-mail a ser utilizado nas respostas das notificações (Responder para:).' },
        },
        s3: {
            host: { type: String, required: 'Por favor, informe o host do seu bucket S3.' },
            bucket: { type: String, required: 'Por favor, informe o nome do seu bucket S3.' },
            accessKeyID: { type: String, required: 'Por favor, informe o ID da Chave de Acesso do seu bucket S3.' },
            secretAccessKey: { type: String, required: 'Por favor, informe a Chave de Acesso do seu bucket S3.' },
        }
    }

});

// Class Model
var StoreConfigs = mongoose.model('StoreConfigs', StoreConfigsSchema);

module.exports = StoreConfigs;