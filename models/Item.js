const mongoose = require('mongoose');

const ItemSchema = mongoose.Schema({
    title: String,
    variant_title: String,
    basePrice: mongoose.Decimal128,
    discount: mongoose.Decimal128,
    quantity: Number
})

module.exports = ItemSchema;