var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
var CategoriesSchema = new Schema({
    name : { type: String, trim: true, required: 'Informe um nome para a categoria.' },
    subCategories: { type: [{ type: Schema.Types.ObjectId, ref: 'Categories'}], default: []},
    parent: { type: Schema.Types.ObjectId, ref: 'Categories' },
    forUseInBlog: { type: Boolean, default: false},
    forUseInProduct: { type: Boolean, default: false},
    updated: { type: Date, default: Date.now }
});
var Categories = mongoose.model('Categories', CategoriesSchema);
CategoriesSchema.pre("validate", function(next) {
    var category = this;
    var subCategories = category.subCategories;
    var subCategoriesLength = subCategories.length;
    if(subCategoriesLength){
        persistSubCategories(function(err){
            if(err){
                next(err);
            } else {
                next();
            }
        });
    } else {
        next();
    }
    function persistSubCategories(callback, pointer){
        var pointer = pointer || 0;
        if(pointer < subCategoriesLength){
            subCategories[pointer].parent = category._id;
            subCategories[pointer].__v = 0;
            console.log(subCategories[pointer].__v);
            subCategories[pointer].save(function(err){
                console.log(err);
                if(err){
                    callback(err);
                } else {
                    pointer++;
                    persistSubCategories(callback, pointer);
                }
            });
        } else {
            callback();
        }
    }
});
module.exports = Categories;