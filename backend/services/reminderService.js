const Invoice = require("../models/invoice");
const Payment = require("../models/payment");
const Reminder = require("../models/reminder");

const { sendWhatsAppMessage } = require("./whatsappServices");

async function processDueReminders() {
    try {
        console.log("Checking for due invoices...");

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const invoices = await Invoice.find({
            dueDate: {
                $lte: today
            }
        }).populate("customer");

        console.log(
            `Found ${invoices.length} invoice(s) with due dates reached.`
        );

        for (const invoice of invoices) {

            if (!invoice.customer) {
                console.log(
                    `Skipping ${invoice.invoiceNumber}: customer not found.`
                );
                continue;
            }

            if (!invoice.dueDate) {
                continue;
            }

            // Get all payments for this invoice
            const payments = await Payment.find({
                invoice: invoice._id
            });

            const totalPaid = payments.reduce(
                (total, payment) => total + Number(payment.amount),
                0
            );

            const remainingAmount = Math.max(
                Number(invoice.finalAmount) - totalPaid,
                0
            );

            // Stop reminders when invoice is fully paid
            if (remainingAmount <= 0) {
                console.log(
                    `Skipping ${invoice.invoiceNumber}: invoice is fully paid.`
                );
                continue;
            }

            const phone = invoice.customer.phone.replace(/\D/g, "");

            const dueDate = new Date(invoice.dueDate)
                .toLocaleDateString("en-IN");

            // Find the most recent successful reminder
            const lastReminder = await Reminder.findOne({
                invoice: invoice._id,
                status: "SENT"
            }).sort({
                sentAt: -1
            });

            let reminderType = null;

            // -----------------------------------------
            // FIRST REMINDER - DUE DATE
            // -----------------------------------------

            if (!lastReminder) {
                reminderType = "DUE_DATE";
            }

            // -----------------------------------------
            // OVERDUE REMINDER - EVERY 3 DAYS
            // -----------------------------------------

            else if (lastReminder.type === "DUE_DATE") {

                const daysSinceLastReminder =
                    (today - new Date(lastReminder.sentAt))
                    / (1000 * 60 * 60 * 24);

                if (daysSinceLastReminder >= 3) {
                    reminderType = "OVERDUE";
                }

            }

            else if (lastReminder.type === "OVERDUE") {

                const daysSinceLastReminder =
                    (today - new Date(lastReminder.sentAt))
                    / (1000 * 60 * 60 * 24);

                if (daysSinceLastReminder >= 3) {
                    reminderType = "OVERDUE";
                }
            }

            // No reminder required today
            if (!reminderType) {
                console.log(
                    `Skipping ${invoice.invoiceNumber}: next reminder is not due yet.`
                );
                continue;
            }

            // -----------------------------------------
            // MESSAGE
            // -----------------------------------------

            let message;

            if (reminderType === "DUE_DATE") {

                message = `Hello ${invoice.customer.name},

This is a reminder regarding your invoice ${invoice.invoiceNumber}.

Amount due: ₹${remainingAmount.toLocaleString("en-IN")}
Due date: ${dueDate}

नमस्ते ${invoice.customer.name},

यह आपके बिल ${invoice.invoiceNumber} के भुगतान के संबंध में एक याद दिलाने वाला संदेश है।

बकाया राशि: ₹${remainingAmount.toLocaleString("en-IN")}
भुगतान की अंतिम तिथि: ${dueDate}

कृपया निर्धारित तिथि तक भुगतान कर दें।

धन्यवाद।
Lakshay Sofa Set Center`;

            } else {

                message = `Hello ${invoice.customer.name},

This is a reminder that payment for invoice ${invoice.invoiceNumber} is overdue.

Outstanding amount: ₹${remainingAmount.toLocaleString("en-IN")}
Due date: ${dueDate}

Please clear the pending amount at your earliest convenience.

नमस्ते ${invoice.customer.name},

यह आपके बिल ${invoice.invoiceNumber} के लंबित भुगतान के संबंध में अनुस्मारक है।

बकाया राशि: ₹${remainingAmount.toLocaleString("en-IN")}
भुगतान की अंतिम तिथि: ${dueDate}

कृपया लंबित राशि का भुगतान जल्द से जल्द कर दें।

धन्यवाद।
Lakshay Sofa Set Center`;
            }

            console.log(
                `Sending ${reminderType} reminder for ${invoice.invoiceNumber} to ${phone}`
            );

            const sent = await sendWhatsAppMessage(
                `91${phone}`,
                message
            );

            await Reminder.create({
                invoice: invoice._id,
                customer: invoice.customer._id,
                phone: phone,
                type: reminderType,
                message: message,
                status: sent ? "SENT" : "FAILED",
                sentAt: sent ? new Date() : null
            });

            if (sent) {
                console.log(
                    `${reminderType} reminder sent successfully for ${invoice.invoiceNumber}`
                );
            } else {
                console.log(
                    `${reminderType} reminder failed for ${invoice.invoiceNumber}`
                );
            }
        }

    } catch (error) {
        console.error("Reminder processing error:");
        console.error(error);
    }
}

module.exports = {
    processDueReminders
};