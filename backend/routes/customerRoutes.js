const express = require('express');
const Customer = require('../models/customer');
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {name , phone , address } =req.body;

        if(!name || !name.trim()){
            return res.status(400).json({
                message : "Customer name is required"
            });
        }
        if(!phone || !phone.trim()){
            return res.status(400).json({
                message : "Customer phone number is required"
            });
        }
        if(!address || !address.trim()){
            return res.status(400).json({
                message : "Customer address is required"
            });
        }

        const customer = await Customer.create({
            name : name.trim(),
            phone : phone.trim(),
            address : address.trim()
        });

        res.status(201).json(customer);
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

router.get("/",authMiddleware, async (req, res) => {
    try {
        const customers = await Customer.find({
            isDeleted : { $ne: true }
        }).sort({ name: 1 });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get("/:id",authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }
        const customer = await Customer.findOne({
            id : req.params.id , isDeleted : {$ne : true }});
         if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.put("/:id", authMiddleware , async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }

        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        if (customer.isDeleted) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        customer.isDeleted = true;

        await customer.save();

        res.status(200).json({
            message: "Customer deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


module.exports = router;