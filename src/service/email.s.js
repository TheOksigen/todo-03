const nodemailer = require("nodemailer");
require('dotenv').config();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
});

async function salam() {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER, // sender address
            to: "sultanbanuahmadli@gmail.com", // list of recipients
            subject: "Hello", // subject line
            // text: "Hello world?asdasdasd", // plain text body
            html: "<b>Hello world?</b>", // HTML body
        });

        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}

salam()