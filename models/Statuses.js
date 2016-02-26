var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatusesSchema = new Schema({
    step: { type: Number, unique: 'O identificador da etapa deve ser único.' }
    , name: { type: String, required: "Informe o nome do status." }
    , mail: { type : Schema.Types.ObjectId, ref: 'Mails' }
});

var Statuses = mongoose.model('Statuses', StatusesSchema);

StatusesSchema.pre('save', function(next) {
    var doc = this;
    if(doc.step >= 1){
        next();
    } else {
        Statuses
        .findOne()
        .sort({step: -1})
        .exec(function(err, OrderStep) {
            if (err) {
                return next(err);
            } else {
                if(OrderStep){
                    doc.step = OrderStep.step + 1;
                } else {
                    doc.step = 1;
                }
                next();
            }
        });        
    }
});

// exports
module.exports = Statuses;