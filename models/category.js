const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

	name:{
		type:String
	},
	icon:{
		type:String
	},
	color:{
		type:String
	}
	
});

categorySchema.method('toJSON', function(){
    const { __v, ...object } = this.toObject();
    const { _id:id, ...result } = object;
    return { ...result, id };
});

const Category = mongoose.model('Category',categorySchema);

module.exports = Category;

