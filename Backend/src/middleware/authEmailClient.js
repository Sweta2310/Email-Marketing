import EmailClient from "../models/EmailClient.model.js";

export async function authEmailClient(req, res, next) {
  const apiKey = req.get("x-api-key")?.trim();

  // console.log(" MIDDLEWARE HIT");
  // console.log(" API KEY RECEIVED:", `[${apiKey}]`);

  const client = await EmailClient.findOne({ apiKey });

  // console.log(" CLIENT FOUND:", client);

  if (!client) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  req.emailClient = client;
  next();
}
