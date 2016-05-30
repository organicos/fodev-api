var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
var CategoriesSchema = new Schema({
    name : { type: String, trim: true, required: 'Informe um nome para a categoria.' },
    subCategories: { type: [{ type: Schema.Types.ObjectId, ref: 'Categories'}], default: []},
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
        persistSubCategories(0, function(err, subcategories){
            if(err){
                next(err);
            } else {
                next();
            }
        });
    } else {
        next();
    }
    function persistSubCategories(pointer, callback){
        if(pointer < subCategoriesLength){
            subCategories[pointer].save(function(err, newSubCategory){
                if(err){
                    var idMap = subCategories.map(function(c){return {_id:c._id}});
                    callback(new Error('Problemas ao salvar a subcategoria ' + subCategories[pointer].name));
                } else {
                    pointer++;
                    if(pointer < subCategoriesLength){
                        persistSubCategories(pointer, callback);
                    } else {
                        callback(null, newSubCategory);
                    }
                }
            });
        }
    }
});
module.exports = Categories;