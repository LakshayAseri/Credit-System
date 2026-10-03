const express = require("express");
const router = express.Router();

const { processDueReminders } = require("../services/reminderServices");

router.get("/run", async (req, res) => {
    try {
        await processDueReminders();

        res.status(200).json({
            message: "Reminder processing completed"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;