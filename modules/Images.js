var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
var Categories = require('./../modules/Categories.js');

var Images = new Schema({

        title : { type: String, trim: true },

        url: { type: String, trim: true },
        
        categories: [{ type : Schema.Types.ObjectId, ref: 'Categories' }],

        updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Images', Images);