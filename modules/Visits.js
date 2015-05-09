var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var Visits = new Schema({

        user : { type : Schema.Types.ObjectId, ref: 'Users' },

        date: { type: Date, default: Date.now }

});
        
module.exports = mongoose.model('Visits', Visits);