import CampaignFolder from "../../models/CampaignFolder.model.js";
import Campaign from "../../models/Campaign.model.js";

/**
 * Create a new campaign folder
 */
export async function createFolder(req, res) {
    try {
        const { name } = req.body;
        const client = req.emailClient;

        if (!name) {
            return res.status(400).json({ error: "Folder name is required" });
        }

        const folder = await CampaignFolder.create({
            name,
            client: client._id
        });

        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ error: "Failed to create folder", details: error.message });
    }
}

/**
 * Get all folders for a client
 */
export async function getFolders(req, res) {
    try {
        const client = req.emailClient;
        const folders = await CampaignFolder.find({ client: client._id }).sort({ createdAt: -1 });
        res.json(folders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch folders", details: error.message });
    }
}
/**
 * Update a folder name
 */
export async function updateFolder(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const client = req.emailClient;

        if (!name) {
            return res.status(400).json({ error: "Folder name is required" });
        }

        const folder = await CampaignFolder.findOneAndUpdate(
            { _id: id, client: client._id },
            { name },
            { new: true }
        );

        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }

        res.json(folder);
    } catch (error) {
        res.status(500).json({ error: "Failed to update folder", details: error.message });
    }
}

/**
 * Delete a folder
 */
export async function deleteFolder(req, res) {
    try {
        const { id } = req.params;
        const client = req.emailClient;

        const folder = await CampaignFolder.findOneAndDelete({ _id: id, client: client._id });
        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }

        // Orphan the campaigns in this folder
        await Campaign.updateMany({ folder: id }, { $set: { folder: null } });

        res.json({ message: "Folder deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete folder", details: error.message });
    }
}
