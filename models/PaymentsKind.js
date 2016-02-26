var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PaymentsKind = mongoose.model('PaymentsKind', {
    name: {type: String, required: "Informe o nome do tipo de pagamento"},
    desc: String,
    fees: [{ type:{
        name: { type: String, required: "Informe o nome da taxa" },
        desc: String,
        math: { type: String, required: 'Informe o cálculo desta taxa. Utilize "x" como a variável da expressão matemática que representa o total do pedido em pagamento. Exemplo: "x * 0.95" para pagamentos utilizando pageseguro que cobra 5% de taxa. Você pode informar quantas taxas forem necessárias para o cálculo do pagamento recebido.'}
    }}]
});

module.exports = mongoose.model('PaymentsKind', PaymentsKind);