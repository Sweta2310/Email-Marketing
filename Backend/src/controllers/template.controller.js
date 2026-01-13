import Template from "../models/Template.model.js";

// Create a new saved template
export const createTemplate = async (req, res) => {
    try {
        const { name, design, html, category, thumbnail } = req.body;
        const client = req.emailClient;

        if (!name) {
            return res.status(400).json({ message: "Template name is required" });
        }

        if (!design || Object.keys(design).length === 0) {
            return res.status(400).json({ message: "Design JSON is required" });
        }

        const newTemplate = await Template.create({
            client: client._id,
            name,
            design,
            html: html || "",
            thumbnail: thumbnail || "",
            category: category || "saved",
            subject: "", // Optional as per schema update
            text: "",
            isSystem: false
        });

        res.status(201).json({
            message: "Template saved successfully",
            template: newTemplate
        });
    } catch (error) {
        console.error("Create template error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

// Get all saved templates for the client
export const getSavedTemplates = async (req, res) => {
    try {
        const client = req.emailClient;

        const templates = await Template.find({
            client: client._id,
            category: "saved"
        }).sort({ createdAt: -1 });

        res.status(200).json(templates);
    } catch (error) {
        console.error("Get saved templates error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get a specific template by ID
export const getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = req.emailClient;

        const template = await Template.findOne({ _id: id, client: client._id });

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        res.status(200).json(template);
    } catch (error) {
        console.error("Get template error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// Get all ready-to-use (system) templates
export const getReadyToUseTemplates = async (req, res) => {
    try {
        const templates = await Template.find({
            isSystem: true,
            category: "ready-to-use"
        }).sort({ createdAt: -1 });

        res.status(200).json(templates);
    } catch (error) {
        console.error("Get ready-to-use templates error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Clone a template to create a new campaign
export const cloneTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const client = req.emailClient;

        if (!name) {
            return res.status(400).json({ message: "Campaign name is required" });
        }

        // Find the template (can be system or user template)
        const template = await Template.findById(id);

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        // Check if user has access (system templates are accessible to all)
        if (!template.isSystem && template.client.toString() !== client._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Import Campaign model
        const Campaign = (await import("../models/Campaign.model.js")).default;

        // Create a new campaign from the template
        const newCampaign = await Campaign.create({
            client: client._id,
            name: name,
            subject: template.subject || name,
            content: template.text || "",
            html: template.html || "",
            design: template.design || {},
            blocks: template.blocks || [],
            status: "draft"
        });

        res.status(201).json(newCampaign);
    } catch (error) {
        console.error("Clone template error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};
