const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const QRCode = require("qrcode");

let latestQR = null;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "credit-system"
    }),
    puppeteer: {
        headless: true,
        protocolTimeout: 120000,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    }
});

client.on("qr", (qr) => {
    latestQR = qr;

    console.log("\nScan this QR code with WhatsApp:\n");
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
    console.log("Whatsapp authenticated successfully.");
})

client.on("ready", () => {
    console.log("Whatsapp client is ready.");
})

client.on("auth_failure", (message) => {
    console.error("Whastapp authentication failed : ", message);
});

client.on("disconnected", (reason) => {
    console.log("Whatsapp disconnected : ", reason);
});

async function sendWhatsAppMessage(phoneNumber, message) {
    try {
        console.log("Checking WhatsApp number:", phoneNumber);
        if (!client.info) {
            console.log("WhatsApp client is not ready yet.");
            return false;
        }
        const numberId = await client.getNumberId(phoneNumber);

        if (!numberId) {
            console.log("This number is not registered on WhatsApp.");
            return false;
        }

        console.log("WhatsApp ID found:", numberId._serialized);

        await client.sendMessage(numberId._serialized, message);

        console.log("WhatsApp message sent successfully.");

        return true;

    } catch (error) {
        console.error("WhatsApp send error:");
        console.error(error);

        return false;
    }
}

client.initialize();

async function getQRCodeBuffer() {
    if (!latestQR) {
        return null;
    }

    return await QRCode.toBuffer(latestQR, {
        type: "png",
        width: 500,
        margin: 2
    });
}

module.exports = {
    client,
    sendWhatsAppMessage,
    getQRCodeBuffer
};