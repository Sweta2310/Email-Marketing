import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import "dotenv/config";
import dns from "dns";

const { resolveMx } = dns.promises;

const validateEmail = (email) => {
    if (!email) return false;
    const trimmedEmail = String(email).trim().toLowerCase();
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = re.test(trimmedEmail);
    // console.log(`[SMTP-RELAY-VAL] Checking format: "${email}" -> Valid: ${isValid}`);
    return isValid;
};

const isValidDomain = async (email) => {
    try {
        const domain = email.split("@")[1];
        if (!domain) return false;
        const mxRecords = await resolveMx(domain);
        // Filter out null MX (RFC 7505) and empty exchanges
        const validMx = mxRecords && mxRecords.filter(mx => mx.exchange && mx.exchange !== "" && mx.exchange !== ".");
        return validMx && validMx.length > 0;
    } catch (error) {
        console.warn(`[SMTP-DOMAIN-VAL] Error for ${email}:`, error.code);
        return false;
    }
};

// This is the REAL transporter that relays to your personal email (e.g. Gmail)
const relayTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const server = new SMTPServer({
    authOptional: true,
    async onRcptTo(address, session, callback) {
        const toAddress = address.address;

        // PROTECTION: Never relay marketing campaigns to the system's own login email
        if (toAddress.toLowerCase() === process.env.EMAIL_USER.toLowerCase()) {
            console.error(`[SHIELD-ACTIVE] BLOCKING marketing send to LOGIN EMAIL: ${toAddress}`);
            return callback(new Error(`Security Block: Cannot send marketing emails to the primary account (${toAddress})`));
        }

        if (!validateEmail(toAddress)) {
            console.error("BLOCKING RCPT TO: Invalid format:", toAddress);
            return callback(new Error(`Invalid format: ${toAddress}`));
        }
        if (!(await isValidDomain(toAddress))) {
            console.error("BLOCKING RCPT TO: Domain not found:", toAddress);
            return callback(new Error(`Domain not found: ${toAddress}`));
        }
        callback();
    },
    onData(stream, session, callback) {
        simpleParser(stream, async (err, parsed) => {
            if (err) {
                console.error("SMTP PARSE ERROR:", err);
                return callback(err);
            }

            const toAddressRec = parsed.to?.text?.toLowerCase();

            // SAFETY NET: Never relay a marketing campaign to the source account itself
            if (toAddressRec === process.env.EMAIL_USER.toLowerCase()) {
                console.warn(`[RELAY-BLOCK] Blocking self-send effort to: ${toAddressRec}`);
                return callback(null); // Silent skip so the internal system thinks it "sent"
            }

            try {
                // Relay the email to your personal account via the real transporter
                console.log(`[RELAY-TARGET] Sending campaign to registered contact: ${toAddressRec}`);
                const info = await relayTransporter.sendMail({
                    from: process.env.EMAIL_USER, // Always send FROM your real email
                    to: parsed.to.text,
                    subject: parsed.subject,
                    text: parsed.text,
                    html: parsed.html
                });
                console.log("EMAIL RELAYED SUCCESSFULLY TO:", parsed.to?.text);
                callback();
            } catch (relayError) {
                console.error("PERSONAL EMAIL RELAY ERROR:", relayError);
                callback(relayError);
            }
        });
    },
    onAuth(auth, session, callback) {
        if (auth.username === "test" && auth.password === "test") {
            return callback(null, { user: 123 });
        }
        return callback(new Error("Invalid username or password"));
    }
});

export const startSmtpServer = () => {
    const PORT = 2525;

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`[SMTP-ERROR] Port ${PORT} in use. SMTP relay will be disabled. API remains active.`);
        } else {
            console.error('[SMTP-ERROR] Unexpected server error:', err);
        }
    });

    server.listen(PORT, '127.0.0.1', () => {
        console.log(`Internal SMTP Server is running on port ${PORT}`);
    });
};

export default server;
