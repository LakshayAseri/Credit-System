const express = require("express");
const mongoose = require("mongoose");

const Invoice = require("../models/invoice");
const Payment = require("../models/payment");
const Customer = require("../models/customer");
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { customer, items, discount = 0, orderDate, deliveryDate, dueDate } = req.body;

        if (!orderDate || !deliveryDate) {
            return res.status(400).json({
                message: "Order date , delivery date are required"
            })
        }

        const order = new Date(orderDate);
        const delivery = new Date(deliveryDate);
        const due = dueDate ? new Date(dueDate) : null;

        if (
            isNaN(order.getTime()) ||
            isNaN(delivery.getTime()) ||
            (dueDate && isNaN(due.getTime()))
        ) {
            return res.status(400).json({
                message: "Invalid Date"
            });
        }

        if (delivery < order) {
            return res.status(400).json({
                message: "Delivery date cannot be before order date"
            })
        }

        if (dueDate && due < delivery) {
            return res.status(400).json({
                message: "Due date cannot be before deivery date"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(customer)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }

        const customerData = await Customer.findOne({
            _id: customer,
            isDeleted: { $ne: true }
        });

        if (!customerData) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Invoice must contain at least one item"
            });
        }


        let totalAmount = 0;

        const updatedItems = [];

        for (const item of items) {
            if (!item.productName || !item.productName.trim()) {
                return res.status(400).json({
                    message: "product name is required"
                });
            }

            if (!item.quantity || item.quantity <= 0) {
                return res.status(400).json({
                    message: "quantity must be greater than 0"
                });
            }

            if (item.unitPrice === undefined || item.unitPrice < 0) {
                return res.status(400).json({
                    message: "Unit price cannot be negative"
                });
            }

            const amount = item.quantity * item.unitPrice;

            totalAmount = totalAmount + amount;

            updatedItems.push({
                productName: item.productName.trim(),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount
            });
        }

        if (discount < 0) {
            return res.status(400).json({
                message: "Discount cannot be negative"
            });
        }

        if (discount > totalAmount) {
            return res.status(400).json({
                message: "Discount cannot be greater than invoice amount"
            });
        }

        const finalAmount = totalAmount - discount;

        const invoice = await Invoice.create({
            ...req.body,
            items: updatedItems,
            discount,
            finalAmount
        });

        res.status(201).json(invoice);
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Invoice number already exists"
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
})

router.get("/", authMiddleware, async (req, res) => {
    try {

        const invoices = await Invoice.find()
            .populate("customer", "name phone address")
            .sort({ orderDate: -1 });

        const invoiceIds = invoices.map(
            (invoice) => invoice._id
        );

        const payments = await Payment.find({
            invoice: { $in: invoiceIds }
        });


        const invoicesWithStatus = invoices.map((invoice) => {

            const invoicePayments = payments.filter(
                (payment) =>
                    payment.invoice.toString() ===
                    invoice._id.toString()
            );

            const totalPaid = invoicePayments.reduce(
                (total, payment) =>
                    total + payment.amount,
                0
            );

            const remainingAmount = Math.max(
                invoice.finalAmount - totalPaid,
                0
            );

            let status;

            if (totalPaid === 0) {

                status = "PENDING";

            } else if (remainingAmount > 0) {

                status = "PARTIALLY_PAID";

            } else {

                status = "CLEARED";

            }

            return {
                ...invoice.toObject(),
                totalPaid,
                remainingAmount,
                status
            };
        })
        res.status(200).json(invoicesWithStatus);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid invoice ID"
            })
        }
        const invoice = await Invoice.findById(req.params.id)
            .populate("customer", "name phone address");
        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        const payments = await Payment.find({
            invoice: invoice._id
        });

        const totalPaid = payments.reduce(
            (total, payment) => total + payment.amount,
            0
        );

        const remainingAmount = invoice.finalAmount - totalPaid;
        const safeRemainingAmount = Math.max(remainingAmount, 0);
        let status;

        if (totalPaid === 0) {
            status = "PENDING";
        } else if (remainingAmount > 0) {
            status = "PARTIALLY_PAID";
        } else {
            status = "CLEARED"
        }

        res.status(200).json({
            invoice,
            totalPaid,
            remainingAmount: safeRemainingAmount,
            status
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
})

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid invoice ID"
            });
        }
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        await Payment.deleteMany({
            invoice: invoice._id
        });

        await Invoice.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Invoice and its payments deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

module.exports = router