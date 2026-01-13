import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary can be configured using CLOUDINARY_URL environment variable
// Format: cloudinary://api_key:api_secret@cloud_name
if (process.env.CLOUDINARY_URL) {
    console.log('[CLOUDINARY] Using CLOUDINARY_URL configuration');
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL
    });
} else {
    console.log('[CLOUDINARY] Using individual environment variables');
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

console.log('[CLOUDINARY CONFIG] Cloud name:', cloudinary.config().cloud_name);

export default cloudinary;
