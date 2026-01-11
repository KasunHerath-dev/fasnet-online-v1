require('dotenv').config({ path: require('path').resolve(__dirname, '../../secure_config/.env') });
const mongoose = require('mongoose');
const Module = require('../src/models/Module');

const seedMissingModules = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is undefined.');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Missing modules identified from WUSL academic flow
        const missingModules = [
            // ELPC - English Language Proficiency Course (Required for all students)
            { code: 'ELPC1101', title: 'English Language Proficiency Test I (ELPT I)', credits: 0, level: 1, semester: 1, department: 'ELPC', isCompulsory: true },
            { code: 'ELPC2201', title: 'English Language Proficiency Test II (ELPT II)', credits: 0, level: 2, semester: 1, department: 'ELPC', isCompulsory: true },

            // STAT - Statistics (separate from MATH) - Level 1
            { code: 'STAT1113', title: 'Introductory Statistics', credits: 3, level: 1, semester: 1, department: 'STAT', isCompulsory: true },
            { code: 'STAT1123', title: 'Probability and Distributions', credits: 3, level: 1, semester: 1, department: 'STAT', isCompulsory: true },
            { code: 'STAT1213', title: 'Statistical Inference I', credits: 3, level: 1, semester: 2, department: 'STAT', isCompulsory: true },
            { code: 'STAT1223', title: 'Data Analysis Methods', credits: 3, level: 1, semester: 2, department: 'STAT', isCompulsory: true },

            // STAT - Level 2
            { code: 'STAT2113', title: 'Statistical Inference II', credits: 3, level: 2, semester: 1, department: 'STAT', isCompulsory: true },
            { code: 'STAT2123', title: 'Sampling Theory', credits: 3, level: 2, semester: 1, department: 'STAT', isCompulsory: true },
            { code: 'STAT2134', title: 'Design of Experiments', credits: 4, level: 2, semester: 1, department: 'STAT', isCompulsory: true },
            { code: 'STAT2213', title: 'Regression and Correlation', credits: 3, level: 2, semester: 2, department: 'STAT', isCompulsory: true },
            { code: 'STAT2223', title: 'Categorical Data Analysis', credits: 3, level: 2, semester: 2, department: 'STAT', isCompulsory: true },
            { code: 'STAT2234', title: 'Time Series and Forecasting', credits: 4, level: 2, semester: 2, department: 'STAT', isCompulsory: true },

            // STAT - Level 3
            { code: 'STAT3114', title: 'Multivariate Statistical Analysis', credits: 4, level: 3, semester: 1, department: 'STAT', isCompulsory: false },
            { code: 'STAT3123', title: 'Stochastic Processes', credits: 3, level: 3, semester: 1, department: 'STAT', isCompulsory: false },
            { code: 'STAT3133', title: 'Bayesian Statistics', credits: 3, level: 3, semester: 1, department: 'STAT', isCompulsory: false },
            { code: 'STAT3214', title: 'Statistical Quality Control', credits: 4, level: 3, semester: 2, department: 'STAT', isCompulsory: false },
            { code: 'STAT3223', title: 'Survival Analysis', credits: 3, level: 3, semester: 2, department: 'STAT', isCompulsory: false },
            { code: 'STAT3233', title: 'Statistical Computing', credits: 3, level: 3, semester: 2, department: 'STAT', isCompulsory: false },

            // STAT - Level 4
            { code: 'STAT4114', title: 'Advanced Statistical Modeling', credits: 4, level: 4, semester: 1, department: 'STAT', isCompulsory: false },
            { code: 'STAT4123', title: 'Data Science and Analytics', credits: 3, level: 4, semester: 1, department: 'STAT', isCompulsory: false },
            { code: 'STAT4218', title: 'Research Project', credits: 8, level: 4, semester: 2, department: 'STAT', isCompulsory: true },

            // MMOD - Mathematical Modelling - Level 1
            { code: 'MMOD1113', title: 'Introduction to Mathematical Modeling', credits: 3, level: 1, semester: 1, department: 'MMOD', isCompulsory: true },
            { code: 'MMOD1213', title: 'Discrete Mathematics', credits: 3, level: 1, semester: 2, department: 'MMOD', isCompulsory: true },

            // MMOD - Level 2
            { code: 'MMOD2113', title: 'Optimization Techniques', credits: 3, level: 2, semester: 1, department: 'MMOD', isCompulsory: true },
            { code: 'MMOD2123', title: 'Operations Research I', credits: 3, level: 2, semester: 1, department: 'MMOD', isCompulsory: true },
            { code: 'MMOD2213', title: 'Operations Research II', credits: 3, level: 2, semester: 2, department: 'MMOD', isCompulsory: true },
            { code: 'MMOD2224', title: 'Computational Mathematics', credits: 4, level: 2, semester: 2, department: 'MMOD', isCompulsory: true },

            // MMOD - Level 3
            { code: 'MMOD3114', title: 'Advanced Mathematical Modeling', credits: 4, level: 3, semester: 1, department: 'MMOD', isCompulsory: false },
            { code: 'MMOD3123', title: 'Game Theory', credits: 3, level: 3, semester: 1, department: 'MMOD', isCompulsory: false },
            { code: 'MMOD3214', title: 'Simulation and Modeling', credits: 4, level: 3, semester: 2, department: 'MMOD', isCompulsory: false },
            { code: 'MMOD3223', title: 'Econometric Modeling', credits: 3, level: 3, semester: 2, department: 'MMOD', isCompulsory: false },

            // MMOD - Level 4
            { code: 'MMOD4114', title: 'Mathematical Finance', credits: 4, level: 4, semester: 1, department: 'MMOD', isCompulsory: false },
            { code: 'MMOD4218', title: 'Research Project', credits: 8, level: 4, semester: 2, department: 'MMOD', isCompulsory: true }
        ];

        console.log('\\n📚 Seeding Missing Modules...');
        let created = 0;
        let skipped = 0;

        for (const mod of missingModules) {
            const existing = await Module.findOne({ code: mod.code });
            if (!existing) {
                await Module.create(mod);
                created++;
                console.log(`  ✓ ${mod.code} - ${mod.title}`);
            } else {
                skipped++;
                console.log(`  ⚠️  ${mod.code} already exists`);
            }
        }

        console.log(`\\n🎉 Missing modules seeding completed!`);
        console.log(`\\n📊 Summary:`);
        console.log(`  - Created: ${created} new modules`);
        console.log(`  - Skipped: ${skipped} modules (already exist)`);
        console.log(`  - Total Missing Modules: ${missingModules.length}`);
        console.log(`\\n📋 New Department Modules Added:`);
        console.log(`  - ELPC (English Proficiency): 2 modules`);
        console.log(`  - STAT (Statistics): 19 modules`);
        console.log(`  - MMOD (Mathematical Modelling): 13 modules`);
        console.log(`\\n✅ Total modules in database: ${68 + created}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding missing modules:', err);
        process.exit(1);
    }
};

seedMissingModules();
