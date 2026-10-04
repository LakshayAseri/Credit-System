const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();

const connectDB = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");

const { processDueReminders } = require("./services/reminderService");
require("./services/whatsappServices");
// Start WhatsApp service
require("./services/whatsappServices");

const app = express();


// Middleware
app.use(express.json());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173"
    })
);


// Database
connectDB();


// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);


// Health check
app.get("/test", (req, res) => {
    res.status(200).json({
        message: "Credit System backend is running"
    });
});

// Port
const PORT = process.env.PORT || 5000;


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Daily WhatsApp reminder check — 9:00 AM IST
cron.schedule(
    "0 9 * * *",
    async () => {
        console.log("Running daily WhatsApp reminder check...");

        await processDueReminders();
    },
    {
        timezone: "Asia/Kolkata"
    }
);