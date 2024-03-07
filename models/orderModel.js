const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    address: {type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

    coupon: {type:String},

    orderDate: {type: Date, default: Date.now },

    deliveryDate: {type: Date },

    shipping: {type: String, default: 'Free Shipping' },

    totalAmount: {type: Number, require: true },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },

            category: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category'
            },

            quantity: Number,

            price: Number,

            status: {type: String, default: 'Pending'},

            reason: {type: String},

            paymentMethod:{type: String, default: 'Pending'},

            paymentStatus:{type: String, default: 'Pending'}
        },
    ],
})

module.exports = mongoose.model('Order',orderSchema)