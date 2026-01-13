import { smtpTransporter } from "../config/smtp.server.js";
import EmailLog from "../models/EmailLog.model.js";
// import MarketingEmail from "../models/MarketingEmail.model.js";
import User from "../models/auth.model.js";
import { validateEmail, isValidDomain } from "../utils/validation.js";

export async function sendEmail(req, res) {
  const client = req.emailClient;
  const { to, subject, text, html } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Invalid payload: Missing required fields (to, subject, text)" });
  }

  if (!validateEmail(to)) {
    return res.status(400).json({ error: `Invalid email format: ${to}` });
  }

  if (!(await isValidDomain(to))) {
    return res.status(400).json({ error: `Domain not found or unreachable: ${to.split("@")[1]}` });
  }

  // Create log entry in DB
  const emailLog = await EmailLog.create({
    client: client._id,
    to,
    subject,
    text,
    html: html || `<b>${text}</b>`,
    status: "pending"
  });

  try {
    // console.log(`[SendEmail] Attempting to send mail to: ${to}`);
    // 🔥 ACTUALLY SEND THE MAIL
    const info = await smtpTransporter.sendMail({
      from: `no-reply@${client.fromDomain}`,
      to,
      subject,
      text,
      html: html || `<b>${text}</b>`
    });

    // console.log("Email sent via API:", info.messageId);

    // Update log to 'sent'
    emailLog.status = "sent";
    emailLog.messageId = info.messageId;
    await emailLog.save();

    return res.json({
      success: true,
      messageId: info.messageId,
      sentBy: client.name,
      from: `no-reply@${client.fromDomain}`,
      to,
      subject
    });
  } catch (error) {
    console.error("API SEND ERROR:", error);

    // Update log to 'failed'
    emailLog.status = "failed";
    emailLog.error = error.message;
    await emailLog.save();

    return res.status(500).json({
      error: "Failed to send email",
      details: error.message
    });
  }
}

export async function sendBulkEmail(req, res) {
  const client = req.emailClient;
  const { emails } = req.body; // Expecting { emails: [{ to, subject, text, html }, ...] }

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "Invalid payload: 'emails' must be a non-empty array" });
  }

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Process emails in parallel
  const sendPromises = emails.map(async (emailData) => {
    const { to, subject, text, html } = emailData;

    if (!to || !subject || !text) {
      results.push({ to, status: "failed", error: "Missing required fields" });
      failureCount++;
      return;
    }

    if (!validateEmail(to)) {
      results.push({ to, status: "failed", error: `Invalid email address format: ${to}` });
      failureCount++;
      return;
    }

    if (!(await isValidDomain(to))) {
      results.push({ to, status: "failed", error: `Domain not found or unreachable: ${to.split("@")[1]}` });
      failureCount++;
      return;
    }

    // Create log entry in DB
    const emailLog = await EmailLog.create({
      client: client._id,
      to,
      subject,
      text,
      html: html || `<b>${text}</b>`,
      status: "pending"
    });

    try {
      // console.log(`[BulkSend] Attempting to send mail to: ${to}`);
      // 🔥 ACTUALLY SEND THE MAIL
      const info = await smtpTransporter.sendMail({
        from: `no-reply@${client.fromDomain}`,
        to,
        subject,
        text,
        html: html || `<b>${text}</b>`
      });

      // Update log to 'sent'
      emailLog.status = "sent";
      emailLog.messageId = info.messageId;
      await emailLog.save();

      results.push({ to, status: "sent", messageId: info.messageId });
      successCount++;
    } catch (error) {
      console.error(`API BULK SEND ERROR for ${to}:`, error);

      // Update log to 'failed'
      emailLog.status = "failed";
      emailLog.error = error.message;
      await emailLog.save();

      results.push({ to, status: "failed", error: error.message });
      failureCount++;
    }
  });

  await Promise.all(sendPromises);

  return res.json({
    success: true,
    summary: {
      total: emails.length,
      success: successCount,
      failed: failureCount
    },
    results
  });
}

export async function sendCampaign(req, res) {
  const client = req.emailClient;
  const { subject, text, html, emails } = req.body;

  if (!subject || !text) {
    return res.status(400).json({ error: "Missing required fields: subject and text" });
  }

  try {
    let targetEmails = [];

    if (emails && Array.isArray(emails) && emails.length > 0) {
      const normalizedEmails = [...new Set(emails.map(e => String(e).toLowerCase().trim()))];

      // STRICT QUERY: Only get emails that are registered, consented, and NOT bounced
      const eligibleInDb = await MarketingEmail.find({
        email: { $in: normalizedEmails },
        marketing_consent: true,
        is_bounced: { $ne: true }
      });

      targetEmails = [...new Set(eligibleInDb.map(m => m.email))];

      // console.log(`[Campaign-Filter] Targeting ${targetEmails.length} unique recipients out of ${normalizedEmails.length} provided addresses.`);
    } else {
      // Global campaign: target all registered marketing emails with consent and no bounces
      const consentedInDb = await MarketingEmail.find({
        marketing_consent: true,
        is_bounced: { $ne: true }
      }, 'email');
      targetEmails = [...new Set(consentedInDb.map(e => e.email))];
    }

    if (targetEmails.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No eligible emails found for this campaign",
        summary: { total: 0, success: 0, failed: 0 }
      });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    const sendPromises = targetEmails.map(async (to) => {
      // Domain validation
      if (!validateEmail(to)) {
        results.push({ to, status: "failed", error: "Invalid email format" });
        failureCount++;
        return;
      }
      if (!(await isValidDomain(to))) {
        results.push({ to, status: "failed", error: "Domain not found or unreachable" });
        failureCount++;
        return;
      }

      const emailLog = await EmailLog.create({
        client: client._id,
        to,
        subject,
        text,
        html: html || `<b>${text}</b>`,
        status: "pending"
      });

      try {
        const info = await smtpTransporter.sendMail({
          from: `no-reply@${client.fromDomain}`,
          to,
          subject,
          text,
          html: html || `<b>${text}</b>`
        });

        emailLog.status = "sent";
        emailLog.messageId = info.messageId;
        await emailLog.save();
        results.push({ to, status: "sent", messageId: info.messageId });
        successCount++;
      } catch (error) {
        emailLog.status = "failed";
        emailLog.error = error.message;
        await emailLog.save();
        results.push({ to, status: "failed", error: error.message });
        failureCount++;
      }
    });

    await Promise.all(sendPromises);

    return res.json({
      success: true,
      summary: {
        total: targetEmails.length,
        actual_sent: results.length,
        success: successCount,
        failed: failureCount
      },
      results
    });
  } catch (error) {
    // console.error("Campaign execution error:", error);
    return res.status(500).json({ error: "Campaign failed", details: error.message });
  }
}
