var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Packings = new Schema({

    name : { type: String, trim: true, required: 'Informe um nome para a categoria.' },
    
    price : { type: Number, trim: true, required: 'Informe o valor da embalagem.' },
    
    desc : { type: String, trim: true, required: 'descreva a embalagem.' },
    
    active : { type: Boolean, default: true },

    updated: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Packings', Packings);