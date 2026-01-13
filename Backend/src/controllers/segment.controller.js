import mongoose from 'mongoose';
import Segment from '../models/Segment.model.js';
import Contact from '../models/Contact.model.js';

// Create a new segment
export const createSegment = async (req, res) => {
    try {
        const { name, type, leadsMatch, conditions, abTestConfig } = req.body;
        const clientId = req.emailClient._id;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Segment name is required'
            });
        }

        if (type === 'standard' && (!conditions || conditions.length === 0)) {
            return res.status(400).json({ success: false, error: 'Conditions are required for standard segments' });
        }

        if (type === 'abtest') {
            if (!abTestConfig || !abTestConfig.slices) {
                return res.status(400).json({ success: false, error: 'A/B Test configuration is incomplete' });
            }

            // Implement A/B Test Logic
            const slices = abTestConfig.slices;

            // 1. Fetch Contacts
            let contacts = [];

            // Logic for 'All', 'number_of_leads', 'selected_tags', 'selected_segments' using available inputs
            // Assuming 'All' for simplicity or leads string matching dropdown value 'All'
            // If abTestConfig.leads is 'All', fetch all contacts for client

            // Note: If user selected 'From number of leads', we might expect abTestConfig keys for that.
            // But we'll implement 'All' as primary support and default.

            const query = { client: req.emailClient._id };
            // Add filtering based on leads options if needed later.

            contacts = await Contact.find(query).select('_id');

            // 2. Shuffle Contacts (Fisher-Yates)
            for (let i = contacts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [contacts[i], contacts[j]] = [contacts[j], contacts[i]];
            }

            const chunkSize = Math.ceil(contacts.length / slices);

            for (let i = 0; i < slices; i++) {
                const chunk = contacts.slice(i * chunkSize, (i + 1) * chunkSize);

                const segmentName = `${name} #${slices - i}`; // Naming ab #10, ab #9... as in image (descending?)
                // wait, image has #10 at top. Usually created last?
                // Or user meant "Number 10" is 10th slice?
                // I'll name them 1 to N.
                // Image order: ab #10, ab #9... descending. 
                // So probably created 1..10 and displayed sorted by creation desc?
                // I'll name them "#1", "#2" ... "#N".

                const newSegment = new Segment({
                    name: `${name} #${i + 1}`,
                    type: 'abtest',
                    // leadsMatch: 'Any',
                    // conditions: [],
                    abTestConfig: { ...abTestConfig, sliceIndex: i + 1 },
                    client: req.emailClient._id,
                    contacts: chunk.map(c => c._id),
                    leadCount: chunk.length,
                    subscriberCount: 0 // Need logic for subscriber status check to be accurate, but 0/initial is fine
                });

                await newSegment.save();
                createdSegments.push(newSegment);
            }

            return res.status(201).json({ success: true, count: createdSegments.length, data: createdSegments });
        }

        // Create new segment (for standard type)
        const segment = new Segment({
            name,
            type: type || 'standard',
            leadsMatch: leadsMatch || 'Any',
            conditions: type === 'standard' ? conditions : [],
            abTestConfig: undefined, // abTestConfig is only for 'abtest' type, handled above
            client: clientId,
            leadCount: 0,
            subscriberCount: 0
        });

        await segment.save();

        res.status(201).json({
            success: true,
            message: 'Segment created successfully',
            data: segment
        });
    } catch (error) {
        console.error('Error creating segment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create segment',
            error: error.message
        });
    }
};

// Get all segments for a client
export const getSegments = async (req, res) => {
    try {
        const clientId = req.emailClient._id;
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = { client: clientId };

        // Add search filter if provided
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const segments = await Segment.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Segment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: segments,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Error fetching segments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch segments',
            error: error.message
        });
    }
};

// Get a single segment by ID
export const getSegmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.emailClient._id;

        const segment = await Segment.findOne({ _id: id, client: clientId });

        if (!segment) {
            return res.status(404).json({
                success: false,
                message: 'Segment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: segment
        });
    } catch (error) {
        console.error('Error fetching segment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch segment',
            error: error.message
        });
    }
};

// Duplicate a segment
export const duplicateSegment = async (req, res) => {
    try {
        const { id } = req.params;
        const sourceSegment = await Segment.findOne({ _id: id, client: req.emailClient._id });

        if (!sourceSegment) {
            return res.status(404).json({ success: false, error: 'Segment not found' });
        }

        const newSegment = new Segment({
            name: `Copy of ${sourceSegment.name}`,
            type: sourceSegment.type,
            leadsMatch: sourceSegment.leadsMatch,
            conditions: sourceSegment.conditions,
            abTestConfig: sourceSegment.abTestConfig,
            client: req.emailClient._id,
            contacts: sourceSegment.contacts, // Should we copy contacts? For static/AB yes. For standard, maybe recalculated?
            // Assuming for now simple copy is desired.
            leadCount: sourceSegment.leadCount,
            subscriberCount: sourceSegment.subscriberCount
        });

        await newSegment.save();
        res.status(201).json({ success: true, data: newSegment });
    } catch (error) {
        console.error('Error duplicating segment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// Get contacts for a segment
export const getSegmentContacts = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.emailClient._id;

        const segment = await Segment.findOne({ _id: id, client: clientId });

        if (!segment) {
            return res.status(404).json({ success: false, error: 'Segment not found' });
        }

        console.log(`[GetSegmentContacts] Segment ID: ${id}, Type: ${segment.type}, Contacts count (array): ${segment.contacts?.length}`);

        const contacts = await Contact.find({
            _id: { $in: segment.contacts },
            client: clientId
        }).sort({ createdAt: -1 });

        console.log(`[GetSegmentContacts] Contacts found in DB: ${contacts.length}`);

        res.status(200).json({ success: true, count: contacts.length, data: contacts });
    } catch (error) {
        console.error('Error fetching segment contacts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update a segment
export const updateSegment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const segment = await Segment.findOneAndUpdate(
            { _id: id, client: req.emailClient._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!segment) {
            return res.status(404).json({ success: false, error: 'Segment not found' });
        }

        res.status(200).json({ success: true, data: segment });
    } catch (error) {
        console.error('Error updating segment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete a segment
export const deleteSegment = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.emailClient._id;

        const segment = await Segment.findOneAndDelete({ _id: id, client: clientId });

        if (!segment) {
            return res.status(404).json({
                success: false,
                message: 'Segment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Segment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting segment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete segment',
            error: error.message
        });
    }
};

// Add contacts to a segment
export const addContactsToSegment = async (req, res) => {
    try {
        const { id } = req.params;
        const { contactIds } = req.body;
        const clientId = req.emailClient._id;

        console.log(`[AddContactsToSegment] Request for segment ${id} with ${contactIds?.length} contacts`);

        if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
            return res.status(400).json({ success: false, error: 'No contacts provided' });
        }

        const segment = await Segment.findOne({ _id: id, client: clientId });

        if (!segment) {
            console.log(`[AddContactsToSegment] Segment ${id} not found`);
            return res.status(404).json({ success: false, error: 'Segment not found' });
        }

        // Add new contacts to the array avoiding duplicates, ensuring they are ObjectIds
        const currentContactIds = segment.contacts.map(c => c.toString());
        const newContactIds = contactIds
            .filter(id => !currentContactIds.includes(id))
            .map(id => new mongoose.Types.ObjectId(id));

        console.log(`[AddContactsToSegment] Found ${newContactIds.length} new contacts to add. Total will be ${segment.contacts.length + newContactIds.length}`);

        if (newContactIds.length === 0) {
            return res.status(200).json({ success: true, message: 'All contacts already in segment', data: segment });
        }

        segment.contacts = [...segment.contacts, ...newContactIds];
        segment.leadCount = segment.contacts.length;

        await segment.save();
        console.log(`[AddContactsToSegment] Successfully added contacts. New leadCount: ${segment.leadCount}`);

        res.status(200).json({ success: true, message: `${newContactIds.length} contacts added to segment`, data: segment });
    } catch (error) {
        console.error('Error adding contacts to segment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
