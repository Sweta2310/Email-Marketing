import express from "express";

import {
    createTemplate,
    getTemplates,
    deleteTemplate,
    createCampaign,
    getCampaigns,
    getCampaignById,
    editCampaign,
    autoSaveCampaign,
    executeCampaign,
    cloneTemplateToCampaign,
    saveCampaignRecipients,
    getReadyToUseTemplates
} from "../controllers/campaign.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { ensureEmailClient } from "../middleware/ensureEmailClient.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect, ensureEmailClient);

// Template Routes
router.post("/templates", createTemplate);
router.get("/templates", getTemplates);
router.get("/templates/ready-to-use", getReadyToUseTemplates);
router.delete("/templates/:id", deleteTemplate);
router.post("/templates/:id/clone", cloneTemplateToCampaign);

// Campaign Routes
router.post("/campaigns", createCampaign);
router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignById);
router.put("/campaigns/:id", editCampaign); // Edit draft
router.post("/campaigns/:id/auto-save", autoSaveCampaign); // Auto-save design
router.post("/campaigns/:id/recipients", saveCampaignRecipients); // NEW: Save selection
router.post("/campaigns/:id/send", executeCampaign); // Execute

export default router;
