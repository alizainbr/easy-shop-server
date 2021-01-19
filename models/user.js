const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

	name:{
		type:String,
		required:true
	},
	email:{
		type:String,
		required:true
	},
	passwordHash:{
		type:String,
		required:true
	},
	phone:{
		type:String,
		required:true
	},
	isAdmin:{
		type:Boolean,
		default:false
	},
	street:{
		type:String,
		default:''
	},
	appartment:{
		type:String,
		default:''
	},
	zip:{
		type:String,
		default:''
	},
	city:{
		type:String,
		default:''
	},
	country:{
		type:String,
		default:''
	}
	
});

userSchema.method('toJSON', function(){
    const { __v, ...object } = this.toObject();
    const { _id:id, ...result } = object;
    return { ...result, id };
});

const User = mongoose.model('User',userSchema);

module.exports = User;

