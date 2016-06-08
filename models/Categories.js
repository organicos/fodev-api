var mongoose = require('mongoose');
var slug = require('slug');
var Schema = mongoose.Schema;
var moment = require('moment');
var CategoriesSchema = new Schema({
    name : { type: String, trim: true, required: 'Informe um nome para a categoria.' },
    subcategories: { type: [{ type: Schema.Types.ObjectId, ref: 'Categories'}], default: []},
    slug: { type: String, trim: true, required: 'Informe a url codificada!', unique: true, dropDups: true }, // SLUG
    parent: { type: Schema.Types.ObjectId, ref: 'Categories' },
    forUseInBlog: { type: Boolean, default: false},
    forUseInProduct: { type: Boolean, default: false},
    updated: { type: Date, default: Date.now }
});
var Categories = mongoose.model('Categories', CategoriesSchema);
CategoriesSchema.pre("validate", function(next) {
    var category = this;
    category.slug = slug(category.slug || '').toLowerCase();
    var subcategories = category.subcategories;
    var subcategoriesLength = subcategories.length;
    if(subcategoriesLength){
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
        if(pointer < subcategoriesLength){
            subcategories[pointer].parent = category._id;
            subcategories[pointer].__v = 0;
            console.log(subcategories[pointer].__v);
            subcategories[pointer].save(function(err){
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