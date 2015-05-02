var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var Articles = new Schema({

        title : { type: String, required: 'Informe o nome do artigo!' },

        content: { type: String, required: 'Informe conteúdo do artigo!' },
        
        encoded_url: { type: String, required: 'Informe a url codificada!' },
        
        img: { type: String, required: 'Informe a url da imagem!' },
        
        images: [{ type : Schema.Types.ObjectId, ref: 'Images' }],
        
        products: [{ type : Schema.Types.ObjectId, ref: 'Products' }],
        
        categories: [{ type : Schema.Types.ObjectId, ref: 'Categories' }],
        
        highlight : { type: Boolean, default: false },
        
        active : { type: Boolean, default: true },
        
        clicks: { type: Number, default: 0 },
        
        updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('articles', Articles);


