var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Articles = new Schema({

        title : { type: String, required: 'Informe o nome do artigo!' },

        content: { type: String, required: 'Informe conteúdo do artigo!' },
        
        encoded_url: { type: String, trim: true, required: 'Informe a url codificada!', unique: true, dropDups: true }, // SLUG
        
        images: { type: [{ type : Schema.Types.ObjectId, ref: 'Files' }], default: []},
        
        author: { type : Schema.Types.ObjectId, ref: 'Users' },
        
        products: { type: [{ type : Schema.Types.ObjectId, ref: 'Products' }], default: []},
        
        categories: { type: [{ type : Schema.Types.ObjectId, ref: 'Categories' }], default: []},
        
        visits: { type: [{ type : Schema.Types.ObjectId, ref: 'Visits' }], default: []},
        
        highlight : { type: Boolean, default: false },
        
        active : { type: Boolean, default: true },
        
        clicks: { type: Number, default: 0 },
        
        updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('articles', Articles);


