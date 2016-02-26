var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RefoundTypes = mongoose.model('RefoundTypes', {
    name: { type: String, default: ""} // 'cash','discount','products'
    , slug: { type: String, default: ""}
    
});
        
module.exports = mongoose.model('RefoundTypes', RefoundTypes);