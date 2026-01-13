import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Template preview images to upload
const imagesToUpload = [
    {
        name: 'product_showcase_preview',
        path: 'C:/Users/LG-182/.gemini/antigravity/brain/e9787684-0071-417c-9d1d-145314cbd87c/product_showcase_preview_1767702658031.png',
        publicId: 'email_templates/product_showcase_preview'
    },
    {
        name: 'event_invitation_preview',
        path: 'C:/Users/LG-182/.gemini/antigravity/brain/e9787684-0071-417c-9d1d-145314cbd87c/event_invitation_preview_1767702678553.png',
        publicId: 'email_templates/event_invitation_preview'
    },
    {
        name: 'newsletter_digest_preview',
        path: 'C:/Users/LG-182/.gemini/antigravity/brain/e9787684-0071-417c-9d1d-145314cbd87c/newsletter_digest_preview_1767702697738.png',
        publicId: 'email_templates/newsletter_digest_preview'
    },
    {
        name: 'flash_sale_preview',
        path: 'C:/Users/LG-182/.gemini/antigravity/brain/e9787684-0071-417c-9d1d-145314cbd87c/flash_sale_preview_1767702714333.png',
        publicId: 'email_templates/flash_sale_preview'
    }
];

async function uploadTemplateImages() {
    console.log('🚀 Starting template preview image uploads...\n');

    const uploadedUrls = {};

    for (const image of imagesToUpload) {
        try {
            console.log(`📤 Uploading ${image.name}...`);

            const result = await cloudinary.uploader.upload(image.path, {
                public_id: image.publicId,
                folder: 'email_templates',
                overwrite: true,
                resource_type: 'image'
            });

            uploadedUrls[image.name] = result.secure_url;
            console.log(`✅ Uploaded: ${result.secure_url}\n`);

        } catch (error) {
            console.error(`❌ Error uploading ${image.name}:`, error.message);
        }
    }

    console.log('\n📋 Summary of uploaded images:');
    console.log('================================');
    Object.entries(uploadedUrls).forEach(([name, url]) => {
        console.log(`${name}: ${url}`);
    });

    return uploadedUrls;
}

uploadTemplateImages()
    .then(() => {
        console.log('\n✅ All template preview images uploaded successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error during upload process:', error);
        process.exit(1);
    });
