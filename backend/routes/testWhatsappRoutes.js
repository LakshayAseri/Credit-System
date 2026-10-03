const express = require("express");
const router = express.Router();

const { sendWhatsAppMessage } = require("../services/whatsappServices");

router.get("/send-test", async (req, res) => {
    try {
        const success = await sendWhatsAppMessage(
            "916377535547", 
            "Hello! This is a test message from the Credit System."
        );

        if (success) {
            return res.status(200).json({
                message: "WhatsApp message sent successfully"
            });
        }

        res.status(500).json({
            message: "Failed to send message"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;