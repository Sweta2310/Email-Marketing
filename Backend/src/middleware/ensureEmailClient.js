import EmailClient from "../models/EmailClient.model.js";
import crypto from 'crypto';

export async function ensureEmailClient(req, res, next) {
    // If authEmailClient already ran and found a client (via API Key), skip logic
    if (req.emailClient) {
        return next();
    }

    // Need User from protect middleware
    if (!req.user) {
        return res.status(401).json({ error: "User authentication required" });
    }

    try {
        let client = await EmailClient.findOne({ owner: req.user._id });

        if (!client) {
            // Create a default client for this user
            const apiKey = crypto.randomBytes(32).toString('hex');
            client = await EmailClient.create({
                name: (req.user.name || "User") + "'s Account",
                apiKey: apiKey,
                fromDomain: "sandbox.com", // Default, user can update later
                owner: req.user._id
            });
            console.log(`Created new EmailClient for user ${req.user.email}`);
        }

        req.emailClient = client;
        next();

    } catch (error) {
        console.error("ensureEmailClient error:", error);
        res.status(500).json({ error: "Failed to ensure email client account", details: error.message });
    }
}
