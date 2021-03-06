var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Categories = mongoose.model('Categories').schema;
var Articles = new Schema({
        title : { type: String, required: 'Informe o nome do artigo!' },
        content: { type: String, required: 'Informe conteúdo do artigo!' },
        slug: { type: String, trim: true, required: 'Informe a url codificada!', unique: true, dropDups: true }, // SLUG
        images: { type: [{ type : Schema.Types.ObjectId, ref: 'Files' }], default: []},
        author: { type : Schema.Types.ObjectId, ref: 'Users' },
        products: { type: [{ type : Schema.Types.ObjectId, ref: 'Products' }], default: []},
        categories: [Categories],
        visits: { type: [{ type : Schema.Types.ObjectId, ref: 'Visits' }], default: []},
        highlight : { type: Boolean, default: false },
        active : { type: Boolean, default: false },
        clicks: { type: Number, default: 0 },
        updated: { type: Date, default: Date.now }
});
module.exports = mongoose.model('articles', Articles);