import express from 'express';
import cors from 'cors';
import { upload, uploadMedia, getMedia, deleteMedia } from '../controllers/upload.controller.js';

const router = express.Router();

// Enable CORS for all upload routes
router.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

router.post('/media', (req, res, next) => {
    console.log('[ROUTE] Received POST /api/upload/media');
    console.log('[ROUTE] Headers:', req.headers);
    next();
}, upload.single('file'), (err, req, res, next) => {
    // Multer error handler
    if (err) {
        console.error('[MULTER ERROR]', err);
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload error'
        });
    }
    next();
}, uploadMedia);

// Keep /image for backward compatibility, mapping to same handler but Expecting 'image' field
router.post('/image', (req, res, next) => {
    console.log('[ROUTE] Received POST /api/upload/image (Legacy)');
    next();
}, upload.single('file'), (err, req, res, next) => { // Changed to 'file' to unify, assuming frontend can adapt or we support both if needed. Actually let's keep 'image' field for legacy route if possible OR just migrate frontend.
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
}, uploadMedia);
router.get('/', getMedia);
router.delete('/:id', deleteMedia);

export default router;
