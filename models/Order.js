const mongoose = require('mongoose');
const ItemSchema = require('./Item.js')

const OrderSchema = mongoose.Schema({
    email: String,
    subtotal_price: mongoose.Decimal128,
    shipping_price: mongoose.Decimal128,
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    cancelled_at: Date,
    f_name: String,
    l_name: String,
    address: String,
    zip: String, 
    city: String, 
    country: String,
    phone: String,
    province: String,
    customer_id: String,
    _id: Number,
    line_items: [ItemSchema]
})

module.exports = mongoose.model('Orders', OrderSchema)