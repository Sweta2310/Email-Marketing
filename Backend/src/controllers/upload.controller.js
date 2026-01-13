import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import Media from '../models/Media.model.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to allow images and videos
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for videos
    },
});

export const uploadMedia = async (req, res) => {
    try {
        console.log('[UPLOAD] Starting upload process...');
        if (!req.file) {
            console.error('[UPLOAD] No file received');
            return res.status(400).json({ message: 'Please upload a file' });
        }

        console.log('[UPLOAD] File received:', req.file.originalname, req.file.mimetype);

        // Convert buffer to base64
        const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        console.log('[UPLOAD] Converted to base64, size:', fileBase64.length);

        // Upload to Cloudinary
        console.log('[UPLOAD] Uploading to Cloudinary...');
        const result = await cloudinary.uploader.upload(fileBase64, {
            folder: 'email_marketing_assets',
            public_id: `${req.file.mimetype.startsWith('video') ? 'vid' : 'img'}_${Date.now()}`,
            resource_type: 'auto',
        });
        console.log('[UPLOAD] Cloudinary success:', result.secure_url);

        // Save to Database
        console.log('[UPLOAD] Saving to database...');
        const newMedia = await Media.create({
            url: result.secure_url,
            publicId: result.public_id,
            name: req.file.originalname,
            type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
            size: result.bytes,
            width: result.width,
            height: result.height,
            format: result.format,
            duration: result.duration || 0, // Duration for videos
        });
        console.log('[UPLOAD] Database success, document ID:', newMedia._id);

        res.status(200).json({
            success: true,
            media: newMedia
        });
    } catch (error) {
        console.error('[UPLOAD] Error occurred:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

export const getMedia = async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, media });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const media = await Media.findById(id);
        if (!media) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(media.publicId);

        // Delete from DB
        await Media.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Media deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
