var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Payments = mongoose.model('Payments', {
    payment : { type : Schema.Types.ObjectId, ref: 'PaymentsKind', required: "Não conseguimos identificar o pagamento."},
    date: { type: Date, required: "Informe a data de pagamento" },
});

module.exports = mongoose.model('Payments', Payments);
