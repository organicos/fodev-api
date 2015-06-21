var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Courses = new Schema({

        name : { type: String, trim: true, required: true },
        
        desc : { type: String, trim: true, required: true },
        
        teacher: { type : Schema.Types.ObjectId, ref: 'Users' },

        workload : { type: Number, trim: true, required: true },

        url: { type: String, trim: true },
        
        categories: [{ type : Schema.Types.ObjectId, ref: 'Categories' }],
        
        user: { type : Schema.Types.ObjectId, ref: 'Users' },
        
        active: { type: Boolean, trim: true, required: true, default: false },

        updated: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Courses', Courses);