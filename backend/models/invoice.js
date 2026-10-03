const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    orderDate: {
        type: Date,
        required: true
    },

    deliveryDate: {
        type: Date,
        required: true
    },

    dueDate: {
        type: Date,
    },

    items: [
        {
            productName: {
                type: String,
                required: true,
                trim: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            unitPrice: {
                type: Number,
                required: true,
                min: 0
            },
            amount: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],

    discount: {
        type: Number,
        default: 0,
        min: 0
    },

    finalAmount: {
        type: Number,
        required: true,
        min: 0
    },

    notes: {
        type: String,
        trim: true
    }

})

module.exports = mongoose.model("Invoice" , invoiceSchema);