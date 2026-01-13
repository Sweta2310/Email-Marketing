import Contact from "../models/Contact.model.js";
import List from "../models/List.model.js";
import Segment from "../models/Segment.model.js";
import Sender from "../models/Sender.model.js";
import { validateEmail, isValidDomain } from "../utils/validation.js";

export const addContact = async (req, res) => {
    try {
        const { email, firstName, lastName, consent_source, whatsapp } = req.body;
        const client = req.emailClient;

        if (!email || !consent_source) {
            return res.status(400).json({ message: "Email and consent source are required" });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: `Invalid email format: ${email}` });
        }

        // Check if email already exists for this client
        const existing = await Contact.findOne({ client: client._id, email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: "Contact already exists for this client" });
        }


        const contact = await Contact.create({
            client: client._id,
            email: email.toLowerCase(),
            firstName,
            lastName,
            whatsapp,
            consent_source,
            marketing_consent: true,
            consent_timestamp: new Date()
        });

        res.status(201).json({
            message: "Contact added successfully",
            data: contact
        });
    } catch (error) {
        console.error("Add contact error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

export const bulkAddContacts = async (req, res) => {
    try {
        const { contacts, segmentId } = req.body; // Added segmentId
        const client = req.emailClient;

        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({ message: "A non-empty array of contacts is required" });
        }

        const stats = {
            success: 0,
            failed: 0,
            duplicates: 0,
            errors: []
        };

        const operations = [];
        const emailsToFind = [];

        // Validate and prepare operations
        for (const contactData of contacts) {
            const { email, firstName, lastName, whatsapp, phone, sms, marketing_consent } = contactData;

            if (!email || !validateEmail(email)) {
                stats.failed++;
                stats.errors.push({ email, reason: "Invalid or missing email" });
                continue;
            }

            emailsToFind.push(email.toLowerCase());

            // Normalize marketing_consent
            let normalizedConsent = true;
            if (marketing_consent !== undefined && marketing_consent !== null) {
                if (typeof marketing_consent === 'boolean') {
                    normalizedConsent = marketing_consent;
                } else if (typeof marketing_consent === 'string') {
                    const lower = marketing_consent.trim().toLowerCase();
                    if (['no', 'false', '0', 'off'].includes(lower)) {
                        normalizedConsent = false;
                    } else {
                        normalizedConsent = true;
                    }
                }
            }

            operations.push({
                updateOne: {
                    filter: { client: client._id, email: email.toLowerCase() },
                    update: {
                        $set: {
                            firstName: firstName || undefined,
                            lastName: lastName || undefined,
                            whatsapp: whatsapp || undefined,
                            phone: phone || undefined,
                            sms: sms || undefined,
                            marketing_consent: normalizedConsent,
                            consent_source: "import",
                        },
                        $setOnInsert: {
                            consent_timestamp: new Date(),
                            createdAt: new Date()
                        }
                    },
                    upsert: true
                }
            });
        }

        if (operations.length > 0) {
            const result = await Contact.bulkWrite(operations);
            stats.success = operations.length;

            // If segmentId is provided, add these contacts to the segment
            if (segmentId) {
                // Find all contacts (new and existing) by email
                const allContacts = await Contact.find({
                    client: client._id,
                    email: { $in: emailsToFind }
                }).select('_id');

                const contactIds = allContacts.map(c => c._id);

                if (contactIds.length > 0) {
                    await Segment.updateOne(
                        { _id: segmentId, client: client._id },
                        { $addToSet: { contacts: { $each: contactIds } } }
                    );

                    // Ideally update leadCount based on real size
                    const segment = await Segment.findOne({ _id: segmentId });
                    if (segment && segment.contacts) {
                        segment.leadCount = segment.contacts.length;
                        await segment.save();
                    }
                }
            }
        }

        res.status(200).json({
            message: "Bulk import processed",
            stats
        });

    } catch (error) {
        console.error("Bulk add contacts error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};


export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, whatsapp, marketing_consent } = req.body;
        const client = req.emailClient;

        const contact = await Contact.findOneAndUpdate(
            { _id: id, client: client._id },
            {
                firstName,
                lastName,
                whatsapp,
                marketing_consent,
                consent_timestamp: marketing_consent !== undefined ? new Date() : undefined
            },
            { new: true }
        );

        if (!contact) return res.status(404).json({ message: "Contact not found" });
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = req.emailClient;
        const contact = await Contact.findOne({ _id: id, client: client._id });
        if (!contact) return res.status(404).json({ message: "Contact not found" });
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const searchContacts = async (req, res) => {
    try {
        const client = req.emailClient;
        const { q } = req.query;

        const query = { client: client._id };
        if (q) {
            query.$or = [
                { email: { $regex: q, $options: "i" } },
                { firstName: { $regex: q, $options: "i" } },
                { lastName: { $regex: q, $options: "i" } }
            ];
        }

        const contacts = await Contact.find(query).limit(20);
        res.status(200).json(contacts);
    } catch (error) {
        console.error("Search contacts error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getContacts = async (req, res) => {
    try {
        const client = req.emailClient;
        const contacts = await Contact.find({ client: client._id }).sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        console.error("Get contacts error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getLists = async (req, res) => {
    try {
        const client = req.emailClient;
        const lists = await List.find({ client: client._id }).populate("contacts", "email firstName lastName");
        res.status(200).json(lists);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const createList = async (req, res) => {
    try {
        const { name, description, contacts } = req.body;
        const client = req.emailClient;

        if (!name) return res.status(400).json({ message: "List name is required" });

        const list = await List.create({
            client: client._id,
            name,
            description,
            contacts: contacts || []
        });

        res.status(201).json(list);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const addContactsToList = async (req, res) => {
    try {
        const { listId } = req.params;
        const { contactIds } = req.body;
        const client = req.emailClient;

        if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
            return res.status(400).json({ message: "contactIds array is required" });
        }

        const list = await List.findOne({ _id: listId, client: client._id });
        if (!list) {
            return res.status(404).json({ message: "List not found" });
        }

        // Add contacts to list (avoid duplicates)
        const newContacts = contactIds.filter(id => !list.contacts.includes(id));
        list.contacts.push(...newContacts);
        await list.save();

        res.status(200).json({
            message: `${newContacts.length} contacts added to list`,
            data: list
        });
    } catch (error) {
        console.error("Add contacts to list error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

export const getSegments = async (req, res) => {
    try {
        const client = req.emailClient;
        const segments = await Segment.find({ client: client._id });
        res.status(200).json(segments);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const createSegment = async (req, res) => {
    try {
        const { name, description, conditions } = req.body;
        const client = req.emailClient;

        if (!name) return res.status(400).json({ message: "Segment name is required" });

        // In a real app, you'd calculate matching contacts here or via background job
        // For simplicity, we'll just save the segment definition
        const segment = await Segment.create({
            client: client._id,
            name,
            description,
            conditions: conditions || []
        });

        res.status(201).json(segment);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const updateSegment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, conditions } = req.body;
        const client = req.emailClient;

        const segment = await Segment.findOneAndUpdate(
            { _id: id, client: client._id },
            { name, description, conditions },
            { new: true }
        );

        if (!segment) return res.status(404).json({ message: "Segment not found" });
        res.status(200).json(segment);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const updateContactConsent = async (req, res) => {
    try {
        const { id } = req.params;
        const { marketing_consent } = req.body;
        const client = req.emailClient;

        if (marketing_consent === undefined) {
            return res.status(400).json({ message: "marketing_consent field is required" });
        }

        const contact = await Contact.findOneAndUpdate(
            { _id: id, client: client._id },
            {
                marketing_consent,
                consent_timestamp: new Date(),
                consent_source: "manual_update"
            },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json({
            message: "Consent updated successfully",
            data: contact
        });
    } catch (error) {
        console.error("Update consent error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// =======================
// SENDER CONTROLLERS
// =======================

export const addSender = async (req, res) => {
    try {
        const { name, email } = req.body;
        const client = req.emailClient;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if sender already exists for this client
        const existing = await Sender.findOne({ client: client._id, email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: "Sender already exists for this account" });
        }

        const sender = await Sender.create({
            client: client._id,
            name,
            email: email.toLowerCase(),
            isVerified: false // Default to false, can be implemented later
        });

        res.status(201).json({
            message: "Sender added successfully",
            data: sender
        });
    } catch (error) {
        console.error("Add sender error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

export const getSenders = async (req, res) => {
    try {
        const client = req.emailClient;
        const senders = await Sender.find({ client: client._id }).sort({ createdAt: -1 });
        res.status(200).json(senders);
    } catch (error) {
        console.error("Get senders error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateSender = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const client = req.emailClient;

        if (email && !validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const sender = await Sender.findOneAndUpdate(
            { _id: id, client: client._id },
            { name, email: email?.toLowerCase() },
            { new: true }
        );

        if (!sender) return res.status(404).json({ message: "Sender not found" });
        res.status(200).json(sender);
    } catch (error) {
        console.error("Update sender error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteSender = async (req, res) => {
    try {
        const { id } = req.params;
        const client = req.emailClient;

        const sender = await Sender.findOneAndDelete({ _id: id, client: client._id });

        if (!sender) return res.status(404).json({ message: "Sender not found" });
        res.status(200).json({ message: "Sender deleted successfully" });
    } catch (error) {
        console.error("Delete sender error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const client = req.emailClient;

        const contact = await Contact.findOneAndDelete({ _id: id, client: client._id });

        if (!contact) return res.status(404).json({ message: "Contact not found" });

        // Optionally remove from lists (if referencing)
        // For now, lists reference contacts, so we might want to cleanup List.contacts array:
        await List.updateMany(
            { client: client._id, contacts: id },
            { $pull: { contacts: id } }
        );

        res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
        console.error("Delete contact error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

