var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Files = new Schema({

        name : { type: String, trim: true, required: true },
        
        file_name : { type: String, trim: true, required: true },
        
        type : { type: String, trim: true, required: true },
        
        size : { type: Number, trim: true, required: true },

        url: { type: String, trim: true, required: true },
        
        categories: [{ type : Schema.Types.ObjectId, ref: 'Categories' }],
        
        user: { type : Schema.Types.ObjectId, ref: 'Users' },
        
        appFile: { type:Boolean, required: true, default: false },
        
        privacy: String,

        updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Files', Files);