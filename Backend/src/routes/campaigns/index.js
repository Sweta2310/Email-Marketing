import express from "express";
import { getCampaigns, deleteCampaign, duplicateCampaign } from "../../controllers/campaigns/list.controller.js";
import { createFolder, getFolders, updateFolder, deleteFolder } from "../../controllers/campaigns/folder.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { ensureEmailClient } from "../../middleware/ensureEmailClient.js";

const router = express.Router();

router.use(protect, ensureEmailClient);

router.get("/", getCampaigns);
router.delete("/:id", deleteCampaign);
router.post("/:id/duplicate", duplicateCampaign);

// Folders
router.post("/folders", createFolder);
router.get("/folders", getFolders);
router.put("/folders/:id", updateFolder);
router.delete("/folders/:id", deleteFolder);

export default router;
