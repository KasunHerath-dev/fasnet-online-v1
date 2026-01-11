require('dotenv').config({ path: require('path').resolve(__dirname, '../../secure_config/.env') });
const mongoose = require('mongoose');
const BatchYear = require('../src/models/BatchYear');

const seedAcademicData = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is undefined.');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Seed Batch Years (Academic Years: 2020-2024)
        console.log('\n📚 Seeding Batch Years...');
        const years = [2020, 2021, 2022, 2023, 2024];

        for (const year of years) {
            const existing = await BatchYear.findOne({ year });
            if (!existing) {
                await BatchYear.create({
                    year,
                    isActive: year === 2024 // Only 2024 is currently active
                });
                console.log(`  ✓ Created Batch Year ${year}`);
            } else {
                console.log(`  ⚠️  Batch Year ${year} already exists`);
            }
        }

        console.log('\n🎉 Academic data seeding completed successfully!');
        console.log('\n📋 Academic Structure Seeded:');
        console.log(`  - Batch Years: 2020-2024 (5 batches)`);
        console.log(`  - Active Batch: 2024`);
        console.log('\n💡 What\'s Next:');
        console.log('  1. Login as admin (username: admin, password: Fas@2024!)');
        console.log('  2. Import student data via Excel upload');
        console.log('  3. Students will be assigned combinations (COMB 1/2/3)');
        console.log('  4. Modules and assessments will be created as needed');
        console.log('\n📚 Academic Info from WUSL:');
        console.log('  - 3 Combinations: COMB 1, 2, 3');
        console.log('  - 4 Academic Levels (Years 1-4)');
        console.log('  - 3 Degree Types: General (3y), Joint Major (4y), Special (4y)');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding academic data:', err);
        process.exit(1);
    }
};

seedAcademicData();
