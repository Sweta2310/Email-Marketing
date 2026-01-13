import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { ensureEmailClient } from "../middleware/ensureEmailClient.js";
import {
    createTemplate,
    getSavedTemplates,
    getTemplateById,
    getReadyToUseTemplates,
    cloneTemplate
} from "../controllers/template.controller.js";

const router = express.Router();

// All template routes require auth and email client
router.use(protect, ensureEmailClient);

router.post("/", createTemplate);
router.get("/saved", getSavedTemplates);
router.get("/ready-to-use", getReadyToUseTemplates);
router.post("/:id/clone", cloneTemplate);
router.get("/:id", getTemplateById);

export default router;
