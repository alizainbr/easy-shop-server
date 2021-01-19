const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const multer = require('multer');

const imageTypes = {
	'image/png':'png',
	'image/jpeg':'jpeg',
	'image/png':'png'
};

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

  	const isValid = imageTypes[file.mimetype];

  	let uploadError = new Error('Invalid image format.');

  	if(isValid){

  		uploadError = null;

  	};
    
    cb(uploadError, 'public/uploads')
  
  },
  filename: (req, file, cb) => {
  	
  	const fileName = file.originalname.replace(' ','-');

  	const extension = imageTypes[file.mimetype];

    cb(null, `${fileName}-${Date.now()}.${extension}`);
  
  }

});
 
const uploadOptions = multer({ storage: storage })

router.get('/',async(req,res) => {
	//using query strings
	let filter = {};

	if(req.query.categories){

		filter = {category:req.query.categories.split(',')}

	};

	const productsList = await Product.find(filter).populate('category');

	if(!productsList){

		return res.status(500).json({success:false});

	};

	res.send(productsList);

});

router.get('/:id',async(req,res) => {
	//.populate('category'); will show the details of the category
	if(!mongoose.isValidObjectId(req.params.id)){

		return res.status(400).send("Inavlid product id");

	};

	const product = await Product.findById(req.params.id).populate('category');

	if(!product){

		return res.status(500).json({success:false});

	};

	res.send(product);


});

router.get('/get/count',async(req,res) => {
	//countDocuments counts all the documents within one table

	const productCount = await Product.countDocuments((count) => count);

	if(!productCount){

		return res.status(500).json({success:false});

	};

	res.send({productCount});

});

router.get('/get/featured/:count',async(req,res) => {
	//we are setting a search limit
	const count = req.params.count ? req.params.count : 0;

	//we are filtering data
	const featuredProducts = await Product.find({isFeatured:true}).limit(+count);

	if(!featuredProducts){

		return res.status(500).json({success:false})

	};

	res.send(featuredProducts);

});

router.post('/',uploadOptions.single('image'),async(req,res) => {

	if(!mongoose.isValidObjectId(req.body.category)){

		return res.status(400).send("Inavlid category id");

	};

	const category = await Category.findById(req.body.category);

	const file = req.file;

	if(!category){

		return res.status(400).send("Invalid category.");

	};

	if(!file){

		return res.status(400).send('Invalid image');

	};

	const fileName = req.file.filename;

	const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

	let product = new Product({

		name:req.body.name,
		description:req.body.description,
		richDescription:req.body.richDescription,
		image:`${basePath}${fileName}`,
		brand:req.body.brand,
		price:req.body.price,
		category:req.body.category,
		countInStock:req.body.countInStock,
		rating:req.body.rating,
		numReviews:req.body.numReviews,
		isFeatured:req.body.isFeatured

	});

	product = await product.save();

	if(!product){

		return res.status(500).send("The product could not be created.");

	};

	res.send(product);

});

router.put('/:id',async(req,res) => {

	if(!mongoose.isValidObjectId(req.body.category)){

		return res.status(400).send("Invalid category id");

	};

	if(!mongoose.isValidObjectId(req.params.id)){

		return res.status(400).send("Invalid product id");

	};

	const category = await Category.findById(req.body.category);

	if(!category){

		return res.status(500).send("Invalid category");

	};

	const product = await Product.findByIdAndUpdate(
		req.params.id,
		{
			name:req.body.name,
			description:req.body.description,
			richDescription:req.body.richDescription,
			image:req.body.image,
			brand:req.body.brand,
			price:req.body.price,
			category:req.body.category,
			countInStock:req.body.countInStock,
			rating:req.body.rating,
			numReviews:req.body.numReviews,
			isFeatured:req.body.isFeatured
		},
		{new:true}
		);

	if(!product){

		return res.status(400).send("The product could not be updated.");

	};

	res.send(product);

});

router.put('/galleryimages/:id',uploadOptions.array('images',10),async(req,res) => {

	if(!mongoose.isValidObjectId(req.params.id)){

		return res.status(400).send('Invalid product id.');

	};

	const files = req.files;

	let filesArray = [];

	const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

	if(files){

		files.map((item) => {

			filesArray.push(`${basePath}${item.filename}`);

		});

	};

	const product = await Product.findByIdAndUpdate(
		req.params.id,
		{images:filesArray},
		{new:true}
		);

	if(!product){

		return res.status(500).send('The product could not be updated.');

	};

	res.send(product);

});

router.delete('/:id',async(req,res) => {

	Product.findByIdAndRemove(req.params.id)
		.then((result) => {

			if(result){

				return res.status(200).json({success:true,message:'Product deleted successfully.'});

			}else{

				return res.status(404).json({success:false,message:'Product not found.'});

			}

		})
		.catch((err) => {

			return res.status(500).json({success:false,error:err});

		});

});

module.exports = router;