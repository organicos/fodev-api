var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
        name : {type: String, trim: true},
        email: {
                type: String, 
                trim: true, 
                unique: true,
                required: 'Favor informar o e-mail.',
                match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Forneça um e-mail válido.']
        },
        phone : {type: String, trim: true},
        password: {type: String, trim: true, required: 'Favor informar a senha.'},
        kind: {type: String, default: 'customer'},
        newsletter: {type: Boolean, default: 0},
        token: String
});

module.exports = mongoose.model('users', Users);


