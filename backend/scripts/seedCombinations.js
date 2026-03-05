require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Module = require('../src/models/Module');
const SystemSetting = require('../src/models/SystemSetting');

const seedCombinations = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error('MONGO_URI is undefined.');
            process.exit(1);
        }
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // 1. Seed Combinations Definitions (Metadata)
        const combinationDefs = {
            '1': { description: 'Physical Science', subjects: ['MATH', 'STAT', 'CMIS', 'ELTN', 'IMGT'] },
            '2': { description: 'Applied Electronics', subjects: ['MATH', 'STAT', 'ELTN', 'IMGT'] },
            '3': { description: 'Industrial Management', subjects: ['MATH', 'STAT', 'IMGT', 'CMIS'] },
            '4': { description: 'Combined Math', subjects: ['MATH', 'STAT', 'IMGT', 'CMIS'] }, // Assuming similar to 3? Or different?
            'B': { description: 'Biological Science', subjects: ['ZOO', 'BOT', 'CHEM', 'CMIS', 'IMGT'] },
            'P': { description: 'Physical Science (General)', subjects: ['PHYS', 'MATH', 'CHEM', 'CMIS', 'IMGT'] },
            'I': { description: 'Industrial Management (Special)', subjects: ['IMGT', 'CMIS', 'MATH', 'STAT'] },
            'M': { description: 'Mathematical Modeling (Special)', subjects: ['MMOD', 'MATH', 'STAT', 'CMIS', 'IMGT'] }
        };

        await SystemSetting.findOneAndUpdate(
            { key: 'academic_combinations' },
            {
                key: 'academic_combinations',
                value: combinationDefs,
                description: 'Definitions of allowed departments per combination'
            },
            { upsert: true, new: true }
        );
        console.log('✅ Seeded Combination Definitions into SystemSettings');

        // Module data from wusl_module_tracker.md
        const modules = [
            // LEVEL 1 - SEMESTER 1
            { code: 'CMIS 1113', title: 'Introduction to Computers and Operating Systems', credits: 3, level: 1, semester: 1, department: 'CMIS' },
            { code: 'CMIS 1123', title: 'Computer Programming I', credits: 3, level: 1, semester: 1, department: 'CMIS' },
            { code: 'CMIS 1131', title: 'Practical Computing I', credits: 1, level: 1, semester: 1, department: 'CMIS' },
            { code: 'ELTN 1112', title: 'Fundamentals of Electricity and Magnetism', credits: 2, level: 1, semester: 1, department: 'ELTN' },
            { code: 'ELTN 1122', title: 'Introduction to Semiconductors', credits: 2, level: 1, semester: 1, department: 'ELTN' },
            { code: 'ELTN 1132', title: 'Basic Digital Electronics', credits: 2, level: 1, semester: 1, department: 'ELTN' },
            { code: 'MATH 1112', title: 'Introduction to Mathematics I', credits: 2, level: 1, semester: 1, department: 'MATH' },
            { code: 'STAT 1113', title: 'Introduction to Probability and Statistics I', credits: 3, level: 1, semester: 1, department: 'STAT' },
            { code: 'IMGT 1112', title: 'Principles of Management', credits: 2, level: 1, semester: 1, department: 'IMGT' },
            { code: 'IMGT 1122', title: 'Business Economics', credits: 2, level: 1, semester: 1, department: 'IMGT' },
            { code: 'IMGT 1132', title: 'Entrepreneurial Dynamics', credits: 2, level: 1, semester: 1, department: 'IMGT' },

            // LEVEL 1 - SEMESTER 2
            { code: 'CMIS 1212', title: 'Computer Programming II', credits: 2, level: 1, semester: 2, department: 'CMIS' },
            { code: 'CMIS 1221', title: 'Practical Computing II', credits: 1, level: 1, semester: 2, department: 'CMIS' },
            { code: 'ELTN 1212', title: 'Basic Electronics - Lab', credits: 2, level: 1, semester: 2, department: 'ELTN' },
            { code: 'ELTN 1222', title: 'General Physics', credits: 2, level: 1, semester: 2, department: 'ELTN' },
            { code: 'MATH 1212', title: 'Introduction to Mathematics II', credits: 2, level: 1, semester: 2, department: 'MATH' },
            { code: 'MATH 1222', title: 'Differential Equations', credits: 2, level: 1, semester: 2, department: 'MATH' },
            { code: 'STAT 1213', title: 'Introduction to Probability and Statistics II', credits: 3, level: 1, semester: 2, department: 'STAT' },
            { code: 'IMGT 1212', title: 'Principles of Accounting', credits: 2, level: 1, semester: 2, department: 'IMGT' },
            { code: 'IMGT 1222', title: 'Marketing Management', credits: 2, level: 1, semester: 2, department: 'IMGT' },

            // LEVEL 2 - SEMESTER 1
            { code: 'CMIS 2113', title: 'Object-oriented Programming', credits: 3, level: 2, semester: 1, department: 'CMIS' },
            { code: 'CMIS 2123', title: 'Database Management Systems', credits: 3, level: 2, semester: 1, department: 'CMIS' },
            { code: 'ELTN 2112', title: 'Electricity and Magnetism', credits: 2, level: 2, semester: 1, department: 'ELTN' },
            { code: 'ELTN 2121', title: 'Electricity and Magnetism - Lab', credits: 1, level: 2, semester: 1, department: 'ELTN' },
            { code: 'MATH 2114', title: 'Linear Algebra I', credits: 4, level: 2, semester: 1, department: 'MATH' },
            { code: 'STAT 2112', title: 'Statistical Inference I', credits: 2, level: 2, semester: 1, department: 'STAT' },
            { code: 'IMGT 2112', title: 'Operations Management I', credits: 2, level: 2, semester: 1, department: 'IMGT' },
            { code: 'IMGT 2122', title: 'Cost & Management Accounting', credits: 2, level: 2, semester: 1, department: 'IMGT' },
            { code: 'IMGT 2132', title: 'Service Industry Concepts', credits: 2, level: 2, semester: 1, department: 'IMGT' },

            // LEVEL 2 - SEMESTER 2
            { code: 'CMIS 2214', title: 'Data Structures & Analysis of Algorithms', credits: 4, level: 2, semester: 2, department: 'CMIS' },
            { code: 'ELTN 2213', title: 'Semiconductor Devices', credits: 3, level: 2, semester: 2, department: 'ELTN' },
            { code: 'ELTN 2221', title: 'Semiconductor Devices - Lab', credits: 1, level: 2, semester: 2, department: 'ELTN' },
            { code: 'ELTN 2232', title: 'Analogue Electronics', credits: 2, level: 2, semester: 2, department: 'ELTN' },
            { code: 'ELTN 2241', title: 'Analogue Electronics - Lab', credits: 1, level: 2, semester: 2, department: 'ELTN' },
            { code: 'MATH 2213', title: 'Linear Algebra II', credits: 3, level: 2, semester: 2, department: 'MATH' },
            { code: 'STAT 2212', title: 'Design of Experiments', credits: 2, level: 2, semester: 2, department: 'STAT' },
            { code: 'STAT 2222', title: 'Regression Analysis', credits: 2, level: 2, semester: 2, department: 'STAT' },
            { code: 'IMGT 2212', title: 'Human Resource Management', credits: 2, level: 2, semester: 2, department: 'IMGT' },
            { code: 'IMGT 2222', title: 'Operations Research I', credits: 2, level: 2, semester: 2, department: 'IMGT' },

            // LEVEL 3 - SEMESTER 1
            { code: 'CMIS 3114', title: 'Data Communication & Computer Networks', credits: 4, level: 3, semester: 1, department: 'CMIS' },
            { code: 'CMIS 3122', title: 'Rapid Application Development', credits: 2, level: 3, semester: 1, department: 'CMIS' },
            { code: 'CMIS 3134', title: 'Computer Architecture & Compiler Design', credits: 4, level: 3, semester: 1, department: 'CMIS' },
            { code: 'CMIS 3142', title: 'Computational Methods', credits: 2, level: 3, semester: 1, department: 'CMIS' },
            { code: 'CMIS 3153', title: 'Advanced Database Systems', credits: 3, level: 3, semester: 1, department: 'CMIS' },
            { code: 'ELTN 3113', title: 'Digital Electronics', credits: 3, level: 3, semester: 1, department: 'ELTN' },
            { code: 'ELTN 3121', title: 'Digital Electronics - Lab', credits: 1, level: 3, semester: 1, department: 'ELTN' },
            { code: 'ELTN 3133', title: 'Data Acquisition and Signal Processing', credits: 3, level: 3, semester: 1, department: 'ELTN' },
            { code: 'ELTN 3141', title: 'Data Acquisition and Signal Processing – Lab', credits: 1, level: 3, semester: 1, department: 'ELTN' },
            { code: 'MMOD 3113', title: 'Mathematical Methods', credits: 3, level: 3, semester: 1, department: 'MMOD' },
            { code: 'MMOD 3124', title: 'Mathematical Models', credits: 4, level: 3, semester: 1, department: 'MMOD' },
            { code: 'STAT 3112', title: 'Statistical Inference II', credits: 2, level: 3, semester: 1, department: 'STAT' },
            { code: 'STAT 3124', title: 'Time Series Analysis', credits: 4, level: 3, semester: 1, department: 'STAT' },
            { code: 'IMGT 3112', title: 'Operations Management II', credits: 2, level: 3, semester: 1, department: 'IMGT' },
            { code: 'IMGT 3122', title: 'Organization Development', credits: 2, level: 3, semester: 1, department: 'IMGT' },
            { code: 'IMGT 3162', title: 'Business & Industrial Law', credits: 2, level: 3, semester: 1, department: 'IMGT' },

            // LEVEL 3 - SEMESTER 2
            { code: 'CMIS 3214', title: 'Software Engineering', credits: 4, level: 3, semester: 2, department: 'CMIS' },
            { code: 'CMIS 3224', title: 'Web Designing and e-commerce', credits: 4, level: 3, semester: 2, department: 'CMIS' },
            { code: 'CMIS 3234', title: 'Computer Graphics and Visualization', credits: 4, level: 3, semester: 2, department: 'CMIS' },
            { code: 'CMIS 3242', title: 'Mobile and Ubiquitous Computing', credits: 2, level: 3, semester: 2, department: 'CMIS' },
            { code: 'CMIS 3253', title: 'Data Mining', credits: 3, level: 3, semester: 2, department: 'CMIS' },
            { code: 'ELTN 3212', title: 'AC Theory', credits: 2, level: 3, semester: 2, department: 'ELTN' },
            { code: 'ELTN 3222', title: 'Scientific Writing', credits: 2, level: 3, semester: 2, department: 'ELTN' },
            { code: 'ELTN 3233', title: 'Microprocessor and Microcontroller Technology', credits: 3, level: 3, semester: 2, department: 'ELTN' },
            { code: 'ELTN 3241', title: 'Microprocessor and Microcontroller Technology - Lab', credits: 1, level: 3, semester: 2, department: 'ELTN' },
            { code: 'MMOD 3214', title: 'Numerical Methods', credits: 4, level: 3, semester: 2, department: 'MMOD' },
            { code: 'STAT 3212', title: 'Statistical Techniques', credits: 2, level: 3, semester: 2, department: 'STAT' },
            { code: 'STAT 3223', title: 'Operations Research', credits: 3, level: 3, semester: 2, department: 'STAT' },
            { code: 'STAT 3232', title: 'Data Analysis & Preparation of Statistical Reports', credits: 2, level: 3, semester: 2, department: 'STAT' },
            { code: 'IMGT 3212', title: 'Operations Research II', credits: 2, level: 3, semester: 2, department: 'IMGT' },
            { code: 'IMGT 3222', title: 'Management of Technology', credits: 2, level: 3, semester: 2, department: 'IMGT' },
            { code: 'IMGT 3232', title: 'International Business', credits: 2, level: 3, semester: 2, department: 'IMGT' },

            // LEVEL 4 - SEMesters (Select few for now as per tracker)
            { code: 'CMIS 4114', title: 'Artificial Intelligence', credits: 4, level: 4, semester: 1, department: 'CMIS' },
            { code: 'CMIS 4216', title: 'Industrial Training (Special)', credits: 6, level: 4, semester: 2, department: 'CMIS' }
            // Add more L4 as needed, this covers the core request
        ];

        console.log('\\n📚 Seeding Modules from WUSL Tracker...');
        let created = 0;
        let updated = 0;

        for (const mod of modules) {
            // Upsert (update if exists, insert if not)
            const result = await Module.findOneAndUpdate(
                { code: mod.code },
                mod,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            // Check if it was created or updated (not perfect check with findOneAndUpdate but good enough)
            // Actually, we can just log processed.
            console.log(`  ✓ Processed ${mod.code}`);
        }

        console.log(`\n🎉 Combination/Module seeding completed!`);
        console.log(`  - Total Processed: ${modules.length}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding combinations:', err);
        process.exit(1);
    }
};

seedCombinations();
