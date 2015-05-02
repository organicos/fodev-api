var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var Products = new Schema({
    name : { type: String, required: 'Informe o nome do produto!' },

    prices: {type: Array, default: []},
    
    price: {type: Number, required: 'Informe o preço corretamente'},
    
    cost: Number,
    
    dscr : String,

    img: {
            type: String,
            trim: true,
            required: 'Forneça uma url válida no campo imagem.',
            match: [/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/, 'Forneça uma url válida da imagem do produto.']
    },

    category : { type: String, required: 'Informe a categoria!' },
    
    highlight : { type: Boolean, default: 0 },
    
    active : { type: Boolean, default: 0 },
    
    supplier: String,
    
    season: String,
    
    recipes: String,
    
    clicks: { type: Number, default: 0 },
    
    updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Products', Products);


