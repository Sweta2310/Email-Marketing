import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Template from './src/models/Template.model.js';
import { blocksToHTML } from './src/utils/blocksToHTML.js';

dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read templates from JSON file
const templatesData = JSON.parse(
    readFileSync(join(__dirname, '../../ready_to_use_templates.json'), 'utf-8')
);

// Add isSystem flag and generate HTML from blocks for all templates
const templates = templatesData.map(template => ({
    ...template,
    isSystem: true,
    html: template.html || blocksToHTML(template.blocks || [])
}));

const seedTemplates = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('✅ Connected to MongoDB');

        // Clear existing system templates
        await Template.deleteMany({ isSystem: true, category: 'ready-to-use' });
        console.log('🗑️  Cleared existing system templates');

        // Insert new templates
        const inserted = await Template.insertMany(templates);
        console.log(`✅ Successfully seeded ${inserted.length} ready-to-use templates`);

        // Display template names
        inserted.forEach((template, index) => {
            console.log(`   ${index + 1}. ${template.name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding templates:', error);
        process.exit(1);
    }
};

seedTemplates();
