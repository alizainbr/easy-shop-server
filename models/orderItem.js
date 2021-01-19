const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({

	quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }

});

orderItemSchema.method('toJSON', function(){
    const { __v, ...object } = this.toObject();
    const { _id:id, ...result } = object;
    return { ...result, id };
});

const OrderItem = mongoose.model('OrderItem',orderItemSchema);

module.exports = OrderItem;