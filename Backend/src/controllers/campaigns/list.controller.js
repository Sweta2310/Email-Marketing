import Campaign from "../../models/Campaign.model.js";

/**
 * Get all campaigns for the client with search and status filtering
 */
export async function getCampaigns(req, res) {
    try {
        const client = req.emailClient;
        const { search, status, folderId, page = 1, limit = 10 } = req.query;

        const querys = { client: client._id };

        if (search) {
            querys.name = { $regex: search, $options: "i" };
        }

        if (status && status !== "All statuses") {
            querys.status = status;
        }

        if (folderId) {
            querys.folder = folderId;
        }

        const skip = (page - 1) * limit;

        const [campaigns, total] = await Promise.all([
            Campaign.find(querys)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate("template", "name"),
            Campaign.countDocuments(querys)
        ]);

        res.json({
            campaigns,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch campaigns", details: error.message });
    }
}
/**
 * Delete a campaign
 */
export async function deleteCampaign(req, res) {
    try {
        const { id } = req.params;
        const client = req.emailClient;

        const campaign = await Campaign.findOneAndDelete({ _id: id, client: client._id });
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        res.json({ message: "Campaign deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete campaign", details: error.message });
    }
}
/**
 * Duplicate a campaign
 */
export async function duplicateCampaign(req, res) {
    try {
        const { id } = req.params;
        const client = req.emailClient;

        const original = await Campaign.findOne({ _id: id, client: client._id });
        if (!original) return res.status(404).json({ error: "Campaign not found" });

        const copy = await Campaign.create({
            client: client._id,
            name: `${original.name} (Copy)`,
            template: original.template,
            content: original.content,
            blocks: original.blocks,
            status: "draft",
            stats: { total: 0, sent: 0, failed: 0 }
        });

        res.status(201).json(copy);
    } catch (error) {
        res.status(500).json({ error: "Failed to duplicate campaign", details: error.message });
    }
}
