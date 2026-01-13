import nodemailer from "nodemailer";
import "dotenv/config";

async function testSmtp() {
    const transporter = nodemailer.createTransport({
        host: "127.0.0.1", // Use explicit IPv4
        port: 2525,
        secure: false,
        auth: {
            user: "test",
            pass: "test"
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        // console.log("Sending test email to local SMTP server...");
        const info = await transporter.sendMail({
            from: "sender@example.com",
            to: process.env.EMAIL_USER || "your-email@gmail.com",
            subject: "Test SMTP Relay",
            text: "This is a test email sent to the local SMTP server for relaying.",
            html: "<b>This is a test email sent to the local SMTP server for relaying.</b>"
        });

        // console.log("Email sent to local SMTP server:", info.messageId);
    } catch (error) {
        // console.error("Error sending test email:", error);
    }
}

testSmtp();
