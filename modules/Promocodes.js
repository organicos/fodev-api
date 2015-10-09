var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Promocodes = new Schema({

        name : { type: String, trim: true },

        code : { type: String, trim: true },

        discount : { type: Number, default: 0, required: 'Informe o valor do desconto!' },

        used_by : { type : Schema.Types.ObjectId, ref: 'Order' },
        
        end_date: { type: Date, default: Date.now },

        date: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Promocodes', Promocodes);      