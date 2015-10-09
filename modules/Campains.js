var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Campains = new Schema({

        name : { type: String, trim: true },

        discount : { type: Number, default: 0, required: 'Informe o valor do desconto!' },
        
        end_date : { type: Date, default: Date.now },

        used_by : { type: [{ type : Schema.Types.ObjectId, ref: 'Orders' }], default: []},

        date: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Campains', Campains);