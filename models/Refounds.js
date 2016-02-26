var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Refounds = mongoose.model('Refounds', {
    type: { type: String, default: ""}, // 'cash','discount','products'
    value: { type: Number, default: 0 },
    discount : { type : Schema.Types.ObjectId, ref: 'Discounts'},
    products: [{ type : Object }]
});
        
module.exports = mongoose.model('Refounds', Refounds);