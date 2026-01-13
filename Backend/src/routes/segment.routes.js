import express from 'express';
import {
    createSegment,
    getSegments,
    getSegmentById,
    updateSegment,
    deleteSegment,
    duplicateSegment,
    getSegmentContacts,
    addContactsToSegment
} from '../controllers/segment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { ensureEmailClient } from '../middleware/ensureEmailClient.js';

const router = express.Router();

// All routes require authentication and an associated Email Client
router.use(protect);
router.use(ensureEmailClient);

// Create a new segment
router.post('/', createSegment);

// Get all segments
router.get('/', getSegments);

// Get a single segment by ID
router.get('/:id', getSegmentById);

// Get contacts for a segment
router.get('/:id/contacts', getSegmentContacts);

// Add contacts to a segment
router.post('/:id/contacts', addContactsToSegment);

// Update a segment
router.put('/:id', updateSegment);

// Delete a segment
router.delete('/:id', deleteSegment);

// Duplicate a segment
router.post('/:id/duplicate', duplicateSegment);

export default router;
