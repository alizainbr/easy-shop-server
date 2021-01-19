const Category = require('../models/Category');
const express = require('express');
const router = express.Router();

router.get('/',async(req,res) => {

	const categoriesList = await Category.find();

	if(!categoriesList){

		return res.status(500).json({success:false});

	};

	res.send(categoriesList);

});

router.get('/:id',async(req,res) => {

	const category = await Category.findById(req.params.id);

	if(!category){

		return res.status(500).json({success:false,message:'The id for category was wrong.'});

	};

	res.send(category);

})

router.post('/',async(req,res) => {

	let category = new Category({

		name:req.body.name,
		icon:req.body.icon,
		color:req.body.color

	});

	category = await category.save();

	if(!category){

		return res.status(404).send("The category could not be added");

	};

	res.send(category);

});

router.delete('/:id',(req,res) => {

	Category.findByIdAndRemove(req.params.id)
		.then((result) => {

			if(result){

				res.status(200).json({success:true,message:'The category has been deleted.'});

			}else{

				res.status(404).json({success:false,message:'No category found.'});

			}

		})
		.catch((err) => {

			res.status(400).json({success:false,error:err});

		});

});

router.put('/:id',async(req,res) => {

	const category = await Category.findByIdAndUpdate(
		req.params.id,
		{
			name:req.body.name,
			icon:req.body.icon,
			color:req.body.color
		},
		{new:true}
		);

	if(!category){

		return res.status(400).json({success:false,message:'Could not update'});

	};

	res.send(category);

})

module.exports = router;