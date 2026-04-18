import 'dotenv/config';
import mongoose from 'mongoose';
import SystemSetting from './SystemSetting.js';

const MONGODB_URI = process.env.MONGODB_URI;

const DEFAULT_CONFIG = {
    key: 'SCRAPER_CONFIG',
    value: {
        targetUrl: 'https://fas.wyb.ac.lk/notices/',
        selectors: {
            item: 'article.elementor-post',
            title: 'h3.elementor-post__title a',
            excerpt: 'div.elementor-post__excerpt',
            date: 'span.elementor-post-date',
            deep: {
                title: 'h1.elementor-heading-title',
                body: '.elementor-widget-theme-post-content .elementor-widget-container',
                attachments: 'a.elementor-button-link'
            }
        },
        aiModel: 'gemini',
        apiKey: process.env.GEMINI_API_KEY || '',
        autoPublish: false,
        cronSchedule: '*/30 * * * *'
    },
    description: 'Configuration for the Faculty Notice Scraper including updated Elementor selectors.'
};

async function seed() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not set in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to target DB:', MONGODB_URI.split('@')[1] || MONGODB_URI);

        // Update SCRAPER_CONFIG
        await SystemSetting.findOneAndUpdate(
            { key: 'SCRAPER_CONFIG' },
            { $set: DEFAULT_CONFIG },
            { upsert: true, new: true }
        );
        console.log('✅ SCRAPER_CONFIG initialized/updated in target DB.');

        // Update GEMINI_API_KEY if present in .env
        if (process.env.GEMINI_API_KEY) {
            await SystemSetting.findOneAndUpdate(
                { key: 'GEMINI_API_KEY' },
                { 
                    $set: { 
                        value: process.env.GEMINI_API_KEY,
                        description: 'Gemini API Key (Seeded from .env)'
                    }
                },
                { upsert: true }
            );
            console.log('✅ GEMINI_API_KEY synced from .env');
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
