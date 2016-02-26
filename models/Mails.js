var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MailsSchema = new Schema({
    from: { type: String }
    , to: [{ type : Schema.Types.ObjectId, ref: 'Users', required: 'Informe o destinatário do e-mail.' }]
    , subject: { type: String, required: 'Informe o assunto do e-mail.' }
    , message: { type: String, required: 'Informe a mensagem do e-mail.' }
});

var Mails = mongoose.model('Mails', MailsSchema);

// exports
module.exports = Mails;