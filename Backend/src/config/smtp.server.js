import nodemailer from "nodemailer";

// This transporter points to our LOCAL SMTP server (smtpServer.js)
// Controllers will use this to "send" mail internally.
export const smtpTransporter = nodemailer.createTransport({
  host: "127.0.0.1",
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

// REMOVED immediate .verify() to avoid ECONNREFUSED during startup
// The transporter is ready when the server starts listening on 2525.
