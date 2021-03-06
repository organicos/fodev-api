var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var Users = new Schema({
        name : {type: String, trim: true},
        brief: {type: String, trim: true},
        profile_img : { type : Schema.Types.ObjectId, ref: 'Files' },
        email: {
                type: String, 
                trim: true, 
                unique: true,
                required: 'Favor informar o e-mail.',
                match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Forneça um e-mail válido.']
        },
        addresses: { type: [{ type : Schema.Types.ObjectId, ref: 'Addresses' }], default: []},
        phone : {type: String, trim: true},
        password: {type: String, select: false, trim: true, required: 'Favor informar a senha.'},
        kind: {type: String, default: 'customer'},
        newsletter: {type: Boolean, default: false},
        groups: {type: Array, default: []},
        token: {type: String, trim: true},
        updated: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Users', Users);


