const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const express = require('express');
const router = express.Router();

router.get('/',async(req,res) => {
	//second argument in populate is to choose the specific data to fetch
	//sort is sorting from newest to oldest
	const ordersList = await Order.find().populate('user','name').sort({'dateOrdered':-1});

	if(!ordersList){

		return res.status(500).json({success:false});

	};

	res.send(ordersList);

});

router.get('/:id',async(req,res) => {
	//we can populate a table inside an already populated table
	const order = await Order.findById(req.params.id)
	.populate({path:'orderItems',populate:{path:'product',populate:'category'}});

	if(!order){

		return res.status(500).json({success:false});

	};

	res.send(order);

});

router.get('/get/totalsales',async(req,res) => {

	const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ]);

	if(!totalSales){

		return res.status(400).send('Sales could not be generated.');

	};

	res.send({totalSales:totalSales.pop().totalsales});

});

router.get('/get/count',async(req,res) => {

	const ordersCount = await Order.countDocuments((count) => count);

	if(!ordersCount){

		return res.status(500).json({success:false});

	};

	res.send({ordersCount});

});

router.get('/get/userorders/:userid',async(req,res) => {

	const userOrders = await Order.find({user:req.params.userid})
	.populate({path:'orderItems',populate:{path:'product',populate:'category'}})
	.sort({'dateOrdered':-1});

	if(!userOrders){

		return res.status(500).json({success:false});

	};

	res.send(userOrders);

});

router.post('/',async(req,res) => {

	let orderItemsIds = Promise.all(req.body.orderItems.map(async(item) => {
	
			let quantity = item.quantity;
	
			let product = item.product;
	
			let orderItem = new OrderItem({quantity,product});
	
			orderItem = await orderItem.save();
	
			return orderItem._id;
	
		}));

	const orderItemsIdsResolved = await orderItemsIds;

	const totalPrices = await Promise.all(orderItemsIdsResolved.map(async(item) => {

		const orderItem = await OrderItem.findById(item).populate('product');

		const totalPrice = orderItem.product.price * orderItem.quantity;

		return totalPrice;

	}));

	const totalPrice = totalPrices.reduce((a,b) => a+b,0);

	let order = new Order({

		orderItems: orderItemsIdsResolved,
	    shippingAddress1:req.body.shippingAddress1,
	    shippingAddress2:req.body.shippingAddress2,
	    city:req.body.city,
	    zip:req.body.zip,
	    country:req.body.country,
	    phone:req.body.phone,
	    status:req.body.status,
	    totalPrice,
	    user:req.body.user,

	});

	order = await order.save();

	if(!order){

		return res.status(400).send('The order could not be created.');

	};

	res.send(order);

});

router.put('/:id',async(req,res) => {

	const newOrder = await Order.findByIdAndUpdate(
		req.params.id,
		{status:req.body.status},
		{new:true}
		);

	if(!newOrder){

		return res.status(400).send('The category could not be updated');

	};

	res.send(newOrder);

});

router.delete('/:id',async(req,res) => {

	Order.findByIdAndRemove(req.params.id)
		.then(async(result) => {

			if(result){

				await result.orderItems.map(async(item) => {

					await OrderItem.findByIdAndRemove(item);

				});

				return res.status(200).send('Order deleted successfully.');

			}else{

				return res.status(404).send('Order not found.');

			};

		})
		.catch((err) => {

			return res.status(500).json({success:false,error:err});

		});

});

module.exports = router;