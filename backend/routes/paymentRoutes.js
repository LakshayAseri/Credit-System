const express = require("express");
const Payment = require("../models/payment");
const Invoice = require("../models/invoice");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();


// CREATE PAYMENT
router.post("/", authMiddleware,async (req, res) => {
    try {
        const { invoice, amount, date, method } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Payment amount must be greater than 0"
            });
        }

        if (!method) {
            return res.status(400).json({
                message: "Payment method is required"
            })
        }

        if (!["CASH", "UPI", 'CHEQUE'].includes(method)) {
            return res.status(400).json({
                message: "Invalid payment method"
            })
        }

        if (!date) {
            return res.status(400).json({
                message: "Payment date is required"
            });
        }

        const paymentDate = new Date(date);

        if (isNaN(paymentDate.getTime())) {
            return res.status(400).json({
                message: "Invalid payment date"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(invoice)) {
            return res.status(400).json({
                message: "Invalid invoice ID"
            })
        }

        const invoiceData = await Invoice.findById(invoice);

        const paymentDateObject = new Date(date);

        if (paymentDateObject < invoiceData.orderDate) {
            return res.status(400).json({
                message: "Payment date cannot be before invoice order date"
            });
        }
        if (!invoiceData) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        const payments = await Payment.find({ invoice });

        const totalPaid = payments.reduce(
            (total, payment) => total + payment.amount,
            0
        );

        const remainingAmount = invoiceData.finalAmount - totalPaid;

        if (remainingAmount <= 0) {
            return res.status(400).json({
                message: "Invoice is already fully paid"
            });
        }

        if (amount > remainingAmount) {
            return res.status(400).json({
                message: `Payment exceeds remaining amount of ₹${remainingAmount}`
            });
        }

        const payment = await Payment.create({
            invoice,
            amount,
            date,
            method
        });

        res.status(201).json(payment);

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: "invoice",
                select: "invoiceNumber customer",
                populate: {
                    path: "customer",
                    select: "name phone"
                }
            })
            .sort({ date: -1 });

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// GET PAYMENT HISTORY FOR AN INVOICE
router.get("/invoice/:invoiceId", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.invoiceId)) {
            return res.status(400).json({
                message: "Invalid invoice ID"
            });
        }
        const invoice = await Invoice.findById(req.params.invoiceId);

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        const payments = await Payment.find({
            invoice: req.params.invoiceId
        }).sort({ date: -1 });

        res.status(200).json(payments);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

//PAYMENT EDITING

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { amount, date, method } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "payment amount must be greater than 0 "
            });
        }

        if (!method) {
            return res.status(400).json({
                message: "payment method is required"
            });
        }

        if (!["CASH", "UPI", "CHEQUE"].includes(method)) {
            return res.status(400).json({
                message: "Invalid payment method"
            });
        }

        if (!date) {
            return res.status(400).json({
                message: "Payment date is required"
            })
        }

        const paymentDate = new Date(date);

        if (isNaN(paymentDate.getTime())) {
            return res.status(400).json({
                message: "Invalid payment date"
            });
        }

        //Find the existing payment
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid payment ID"
            });
        }
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        // Find the invoice
        const invoice = await Invoice.findById(payment.invoice);

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        const paymentDateObject = new Date(date);

        if (paymentDateObject < invoice.orderDate) {
            return res.status(400).json({
                message: "Payment date cannot be before invoice order date"
            });
        }
        // Find all other payments except the one being edited
        const otherPayments = await Payment.find({
            invoice: payment.invoice,
            _id: { $ne: payment._id }
        });

        // Calculate amount already paid by other payments
        const otherPaymentsTotal = otherPayments.reduce(
            (total, payment) => total + payment.amount,
            0
        );

        // Check whether new payment amount exceeds remaining amount
        if (otherPaymentsTotal + amount > invoice.finalAmount) {
            return res.status(400).json({
                message: "Updated payment exceeds invoice amount"
            });
        }

        // Update payment
        payment.amount = amount;
        payment.date = date;
        payment.method = method;

        await payment.save();

        res.status(200).json(payment);

    } catch (error) {

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
});


//DELETE PAYMENT

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid payment ID"
            });
        }
        const payment = await Payment.findByIdAndDelete(req.params.id);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.status(200).json({
            message: "Payment deleted successfully"
        })
    } catch (error) {

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
})
module.exports = router;