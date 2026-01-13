import Template from "../models/Template.model.js";
import Campaign from "../models/Campaign.model.js";
import EmailLog from "../models/EmailLog.model.js";
import Contact from "../models/Contact.model.js";
import List from "../models/List.model.js";
import Segment from "../models/Segment.model.js";
import CampaignRecipient from "../models/CampaignRecipient.model.js";
import { smtpTransporter } from "../config/smtp.server.js";
import { validateEmail, isValidDomain } from "../utils/validation.js";

// =======================
// TEMPLATE CONTROLLERS
// =======================

export async function createTemplate(req, res) {
    try {
        const { name, subject, text, html, category, isSystem, blocks, thumbnail } = req.body || {};
        const client = req.emailClient;

        const template = await Template.create({
            client: client._id,
            name,
            subject,
            text,
            html,
            blocks: blocks || [],
            thumbnail: thumbnail || "",
            category: category || "saved",
            isSystem: isSystem || false
        });

        res.status(201).json(template);
    } catch (error) {
        res.status(500).json({ error: "Failed to create template", details: error.message });
    }
}

export async function getTemplates(req, res) {
    try {
        const client = req.emailClient;
        const { category } = req.query;

        const querys = {
            $or: [
                { client: client._id },
                { isSystem: true }
            ]
        };

        if (category) {
            querys.category = category;
        }

        const templates = await Template.find(querys).sort({ createdAt: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch templates", details: error.message });
    }
}

export async function getReadyToUseTemplates(req, res) {
    try {
        const templates = await Template.find({
            isSystem: true,
            category: "ready-to-use"
        }).sort({ createdAt: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch ready-to-use templates", details: error.message });
    }
}

export async function deleteTemplate(req, res) {
    try {
        const { id } = req.params;
        const client = req.emailClient;

        const template = await Template.findOne({ _id: id, client: client._id });
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        if (template.isSystem) {
            return res.status(403).json({ error: "System templates cannot be deleted" });
        }

        await Template.findByIdAndDelete(id);

        res.json({ message: "Template deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete template", details: error.message });
    }
}

// Clone Template to Campaign Draft
export async function cloneTemplateToCampaign(req, res) {
    try {
        const { id } = req.params;
        const { name, folderId } = req.body || {};
        const client = req.emailClient;

        const template = await Template.findOne({
            $or: [{ _id: id, client: client._id }, { _id: id, isSystem: true }]
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        const campaign = await Campaign.create({
            client: client._id,
            name: name || `Campaign from ${template.name}`,
            template: template._id,
            content: {
                subject: template.subject,
                text: template.text,
                html: template.html
            },
            blocks: template.blocks || [],
            status: "draft",
            folder: folderId
        });

        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ error: "Failed to clone template", details: error.message });
    }
}

// =======================
// CAMPAIGN CONTROLLERS
// =======================

// Create Campaign (Empty or from Template)
export async function createCampaign(req, res) {
    try {
        const { name, templateId, content, blocks, recipients, folderId } = req.body || {};
        const client = req.emailClient;
        if (!client) {
            console.error('[CREATE CAMPAIGN] No client found in request');
            return res.status(401).json({ error: "Unauthorized: Client context missing" });
        }

        let campaignContent = content || {};
        let campaignBlocks = blocks || [];

        // If templateId is provided, fetch and clone content
        if (templateId) {
            const template = await Template.findById(templateId);
            if (!template) return res.status(404).json({ error: "Template not found" });

            // Clone content from template if not overridden
            campaignContent = {
                subject: template.subject,
                text: template.text,
                html: template.html,
                ...content // Allow override
            };

            // Clone blocks from template if not overridden
            if (!blocks) {
                campaignBlocks = template.blocks || [];
            }
        }

        const campaign = await Campaign.create({
            client: client._id,
            name: name || "Untitled Campaign",
            template: templateId || undefined, // Avoid empty string casting error
            content: campaignContent,
            blocks: campaignBlocks,
            status: "draft",
            folder: folderId || undefined // Avoid empty string casting error
        });

        res.status(201).json(campaign);
    } catch (error) {
        console.error('[CREATE CAMPAIGN ERROR]', error);
        res.status(500).json({ error: "Failed to create campaign", details: error.message });
    }
}

// Save Campaign Recipients
export async function saveCampaignRecipients(req, res) {
    try {
        const { id } = req.params;
        const { type, referenceId, contacts } = req.body || {};
        const client = req.emailClient;

        console.log('[SAVE RECIPIENTS] Campaign ID:', id);
        console.log('[SAVE RECIPIENTS] Request body:', { type, referenceId, contacts });
        console.log('[SAVE RECIPIENTS] Client:', client?._id);

        const campaign = await Campaign.findOne({ _id: id, client: client._id });
        if (!campaign) {
            console.log('[SAVE RECIPIENTS] Campaign not found');
            return res.status(404).json({ error: "Campaign not found" });
        }

        console.log('[SAVE RECIPIENTS] Campaign status:', campaign.status);

        if (campaign.status.toLowerCase() !== "draft") {
            console.log('[SAVE RECIPIENTS] Campaign is not draft, but allowing edit for resend flow');
            // return res.status(400).json({ error: "Cannot modify recipients for a non-draft campaign" });
        }

        let onModel;
        if (type === "list") onModel = "List";
        else if (type === "segment") onModel = "Segment";

        console.log('[SAVE RECIPIENTS] Saving with onModel:', onModel);

        const recipientSelection = await CampaignRecipient.findOneAndUpdate(
            { campaign: id },
            {
                client: client._id,
                type,
                referenceId: referenceId || null,
                onModel,
                contacts: contacts || []
            },
            { new: true, upsert: true }
        );

        console.log('[SAVE RECIPIENTS] Success:', recipientSelection._id);
        res.json({ message: "Recipients saved successfully", data: recipientSelection });
    } catch (error) {
        console.error("Save Recipients Error:", error);
        res.status(500).json({ error: "Failed to save recipients", details: error.message });
    }
}

// Get Campaigns
export async function getCampaigns(req, res) {
    try {
        const client = req.emailClient;
        const campaigns = await Campaign.find({ client: client._id })
            .sort({ createdAt: -1 })
            .populate("template", "name");

        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch campaigns", details: error.message });
    }
}

// Get Campaign By ID
export async function getCampaignById(req, res) {
    try {
        const { id } = req.params;
        const client = req.emailClient;

        const campaign = await Campaign.findOne({ _id: id, client: client._id })
            .populate("template", "name");

        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        // Also fetch recipient selection
        const recipientSelection = await CampaignRecipient.findOne({ campaign: id });

        const campaignObj = campaign.toObject();
        campaignObj.recipientSelection = recipientSelection;

        res.json(campaignObj);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch campaign", details: error.message });
    }
}


// Edit Campaign (Only if Draft)
export async function editCampaign(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body || {};
        const client = req.emailClient;

        // console.log('[EDIT CAMPAIGN] Campaign ID:', id);
        // console.log('[EDIT CAMPAIGN] Client ID:', client._id);
        // console.log('[EDIT CAMPAIGN] Updates:', JSON.stringify(updates, null, 2));

        const campaign = await Campaign.findOne({ _id: id, client: client._id });

        if (!campaign) {
            // console.log('[EDIT CAMPAIGN] Campaign not found');
            return res.status(404).json({ error: "Campaign not found" });
        }

        // console.log('[EDIT CAMPAIGN] Campaign status:', campaign.status);

        // Case-insensitive status check
        // if (campaign.status.toLowerCase() !== "draft") {
        //     // console.log('[EDIT CAMPAIGN] Campaign is not draft, cannot edit');
        //     return res.status(400).json({
        //         error: "Only draft campaigns can be edited",
        //         message: "Only draft campaigns can be edited",
        //         currentStatus: campaign.status
        //     });
        // }

        // specific updates allowed
        if (updates.name) campaign.name = updates.name;
        if (updates.content) campaign.content = { ...campaign.content, ...updates.content };
        if (updates.recipients) campaign.recipients = updates.recipients;
        if (updates.blocks !== undefined) campaign.blocks = updates.blocks; // Allow blocks update
        if (updates.template) campaign.template = updates.template; // Allow template reference
        if (updates.design) campaign.design = updates.design; // Allow design update

        // Update lastSaved timestamp
        campaign.lastSaved = new Date();

        // console.log('[EDIT CAMPAIGN] Saving campaign...');
        await campaign.save();

        // console.log('[EDIT CAMPAIGN] Campaign saved successfully');
        res.json(campaign);
    } catch (error) {
        console.error('[EDIT CAMPAIGN] Error:', error);
        res.status(500).json({ error: "Failed to update campaign", message: error.message, details: error.message });
    }
}

// Auto-Save Campaign Design
export async function autoSaveCampaign(req, res) {
    try {
        const { id } = req.params;
        const { blocks, design } = req.body || {};
        const client = req.emailClient;

        const campaign = await Campaign.findOne({ _id: id, client: client._id });

        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        if (campaign.status !== "Draft") {
            return res.status(400).json({ error: "Only draft campaigns can be auto-saved" });
        }

        // Update blocks and design
        if (blocks) campaign.blocks = blocks;
        if (design) campaign.design = design;

        // Update lastSaved timestamp
        campaign.lastSaved = new Date();

        await campaign.save();

        res.json({
            message: "Campaign auto-saved successfully",
            lastSaved: campaign.lastSaved
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to auto-save campaign", details: error.message });
    }
}

// Send Campaign
export async function executeCampaign(req, res) {
    try {
        const { id } = req.params;
        const client = req.emailClient;

        const campaign = await Campaign.findOne({ _id: id, client: client._id });
        if (!campaign) return res.status(404).json({ error: "Campaign not found" });

        const statusLower = campaign.status.toLowerCase();
        // if (statusLower !== "draft" && statusLower !== "failed") {
        //     return res.status(400).json({ error: "Campaign is already sending or sent" });
        // }

        // 1. Resolve Recipients from CampaignRecipient model
        const selection = await CampaignRecipient.findOne({ campaign: id });
        if (!selection) {
            return res.status(400).json({ error: "No recipients selected for this campaign." });
        }

        let contactIds = [];

        if (selection.type === "individual") {
            contactIds = selection.contacts;
        } else if (selection.type === "list") {
            const list = await List.findOne({ _id: selection.referenceId, client: client._id });
            if (list) contactIds = list.contacts;
        } else if (selection.type === "segment") {
            const segment = await Segment.findOne({ _id: selection.referenceId, client: client._id });
            if (segment) contactIds = segment.contacts;
        } else if (selection.type === "all") {
            const allContacts = await Contact.find({ client: client._id }, { _id: 1 });
            contactIds = allContacts.map(c => c._id);
        }

        if (!contactIds || contactIds.length === 0) {
            return res.status(400).json({ error: "No contacts found for the selection." });
        }

        // Resolve actual emails and filtered for consent/bounces
        const eligibleContacts = await Contact.find({
            _id: { $in: contactIds },
            client: client._id,
            marketing_consent: true,
            is_bounced: false
        });

        if (eligibleContacts.length === 0) {
            return res.status(400).json({ error: "No eligible recipients (consented/not bounced) found." });
        }

        const targetEmails = eligibleContacts.map(c => c.email);

        // 2. Update Status
        campaign.status = "sending";
        campaign.stats.total = targetEmails.length;
        campaign.executedAt = new Date();
        await campaign.save();

        // 3. Send Emails
        let successCount = 0;
        let failureCount = 0;
        const { subject, text, html } = campaign.content;

        const sendPromises = eligibleContacts.map(async (contact) => {
            const to = contact.email;

            // Final domain validation
            if (!(await isValidDomain(to))) {
                failureCount++;
                return;
            }

            const emailLog = await EmailLog.create({
                client: client._id,
                to,
                subject,
                text,
                html: html || `<b>${text}</b>`,
                status: "pending",
                campaign: campaign._id
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
                successCount++;
            } catch (error) {
                emailLog.status = "failed";
                emailLog.error = error.message;
                await emailLog.save();
                failureCount++;
            }
        });

        await Promise.all(sendPromises);

        // 4. Finalize Campaign
        campaign.stats.sent = successCount;
        campaign.stats.failed = failureCount;
        campaign.status = "sent";
        await campaign.save();

        res.json({
            message: "Campaign executed successfully",
            campaignId: campaign._id,
            stats: campaign.stats
        });

    } catch (error) {
        console.error("Campaign Execution Error:", error);
        res.status(500).json({ error: "Campaign execution failed", details: error.message });
    }
}
