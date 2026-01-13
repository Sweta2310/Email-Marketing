import express from "express";
import { authEmailClient } from "../middleware/authEmailClient.js";
import { sendEmail, sendBulkEmail, sendCampaign } from "../controllers/sendEmail.controller.js";

const router = express.Router();

router.post("/v1/send-email", authEmailClient, sendEmail);
router.post("/v1/send-bulk-email", authEmailClient, sendBulkEmail);
router.post("/v1/send-campaign", authEmailClient, sendCampaign);

export default router;
