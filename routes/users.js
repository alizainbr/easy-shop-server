const User = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/',async(req,res) => {

	const usersList = await User.find().select('-passwordHash');

	if(!usersList){

		return res.status(500).json({success:false});

	};

	res.send(usersList);

});

router.get('/:id',async(req,res) => {

	const user = await User.findById(req.params.id).select('-passwordHash');

	if(!user){

		return res.status(500).json({message:'The user with the given id was not found.'});

	};

	res.send(user);

});

router.post('/',async(req,res) => {

	let user = new User({

		name:req.body.name,
		email:req.body.email,
		passwordHash:bcrypt.hashSync(req.body.password,10),
		phone:req.body.phone,
		isAdmin:req.body.isAdmin,
		street:req.body.street,
		appartment:req.body.appartment,
		zip:req.body.zip,
		city:req.body.city,
		country:req.body.country

	});

	user = await user.save();

	if(!user){

		return res.status(400).send("The user can not be created");

	};

	res.send(user);

});

router.post('/register',async(req,res) => {

	let user = new User({

		name:req.body.name,
		email:req.body.email,
		passwordHash:bcrypt.hashSync(req.body.password,10),
		phone:req.body.phone,
		isAdmin:req.body.isAdmin,
		street:req.body.street,
		appartment:req.body.appartment,
		zip:req.body.zip,
		city:req.body.city,
		country:req.body.country

	});

	user = await user.save();

	if(!user){

		return res.status(400).send("The user can not be created");

	};

	res.send(user);

});

router.post('/login',async(req,res) => {

	const user = await User.findOne({email:req.body.email});

	if(!user){

		return res.status(400).send("The user was not found.");

	};

	if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){

		const secretKey = process.env.SECRET;

		const token = jwt.sign({userId:user.id,isAdmin:user.isAdmin},secretKey,{expiresIn:'1d'});

		return res.status(200).send({email:user.email,token});

	}else{

		return res.status(400).send('Password is wrong.');

	};

});

router.get('/get/count',async(req,res) => {

	const userCount = await User.countDocuments((count) => count);

	if(!userCount){

		return res.status(500).json({success:false});

	};

	res.send({userCount});

});

router.delete('/:id',(req,res) => {

	User.findByIdAndDelete(req.params.id)
		.then((result) => {

			if(result){

				res.status(200).json({success:true,message:'User deleted successfully.'});

			}else{

				res.status(404).json({success:false,message:'User not found.'});

			}

		})
		.catch((err) => {

			res.status(500).json({success:false,error:err});

		});

});

router.put('/:id',async(req,res) => {

	const currentUser = await User.findById(req.params.id);

	let newPassword;

	if(req.body.password){

		newPassword = bcrypt.hashSync(req.body.password,10);

	}else{

		newPassword = currentUser.passwordHash;

	};

	const newUser = await User.findByIdAndUpdate(
		req.params.id,
		{
			name:req.body.name,
			email:req.body.email,
			passwordHash:newPassword,
			phone:req.body.phone,
			isAdmin:req.body.isAdmin,
			street:req.body.street,
			appartment:req.body.appartment,
			zip:req.body.zip,
			city:req.body.city,
			country:req.body.country

		},
		{new:true}
		);

	if(!newUser){

		return res.status(400).send('User could not be updated.');

	};

	res.send(newUser);

});

module.exports = router;