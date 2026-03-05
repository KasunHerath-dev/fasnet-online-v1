require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Module = require('../src/models/Module');

const resetAndSeedOfficialModules = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is undefined.');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Step 1: Delete all existing modules
        console.log('\\n🗑️  Deleting all existing modules...');
        const deleteResult = await Module.deleteMany({});
        console.log(`  ✓ Deleted ${deleteResult.deletedCount} modules`);

        // Step 2: Seed with official WUSL modules from wusl_module_tracker.md
        console.log('\\n📚 Seeding Official WUSL Modules...');

        const officialModules = [
            // LEVEL 1 - SEMESTER 1
            { code: 'CMIS1113', title: 'Introduction to Computers and Operating Systems', credits: 3, level: 1, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS1123', title: 'Computer Programming I', credits: 3, level: 1, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS1131', title: 'Practical Computing I', credits: 1, level: 1, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN1112', title: 'Fundamentals of Electricity and Magnetism', credits: 2, level: 1, semester: 1, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN1122', title: 'Introduction to Semiconductors', credits: 2, level: 1, semester: 1, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN1132', title: 'Basic Digital Electronics', credits: 2, level: 1, semester: 1, department: 'ELTN', isCompulsory: true },
            { code: 'MATH1112', title: 'Introduction to Mathematics I', credits: 2, level: 1, semester: 1, department: 'MATH', isCompulsory: true },
            { code: 'STAT1113', title: 'Introduction to Probability and Statistics I', credits: 3, level: 1, semester: 1, department: 'STAT', isCompulsory: true },
            { code: 'IMGT1112', title: 'Principles of Management', credits: 2, level: 1, semester: 1, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT1122', title: 'Business Economics', credits: 2, level: 1, semester: 1, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT1132', title: 'Entrepreneurial Dynamics', credits: 2, level: 1, semester: 1, department: 'IMGT', isCompulsory: true },

            // LEVEL 1 - SEMESTER 2
            { code: 'CMIS1212', title: 'Computer Programming II', credits: 2, level: 1, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS1221', title: 'Practical Computing II', credits: 1, level: 1, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN1212', title: 'Basic Electronics - Lab', credits: 2, level: 1, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN1222', title: 'General Physics', credits: 2, level: 1, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'MATH1212', title: 'Introduction to Mathematics II', credits: 2, level: 1, semester: 2, department: 'MATH', isCompulsory: true },
            { code: 'MATH1222', title: 'Differential Equations', credits: 2, level: 1, semester: 2, department: 'MATH', isCompulsory: true },
            { code: 'STAT1213', title: 'Introduction to Probability and Statistics II', credits: 3, level: 1, semester: 2, department: 'STAT', isCompulsory: true },
            { code: 'IMGT1212', title: 'Principles of Accounting', credits: 2, level: 1, semester: 2, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT1222', title: 'Marketing Management', credits: 2, level: 1, semester: 2, department: 'IMGT', isCompulsory: true },

            // LEVEL 2 - SEMESTER 1
            { code: 'CMIS2113', title: 'Object-oriented Programming', credits: 3, level: 2, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS2123', title: 'Database Management Systems', credits: 3, level: 2, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN2112', title: 'Electricity and Magnetism', credits: 2, level: 2, semester: 1, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN2121', title: 'Electricity and Magnetism - Lab', credits: 1, level: 2, semester: 1, department: 'ELTN', isCompulsory: true },
            { code: 'MATH2114', title: 'Linear Algebra I', credits: 4, level: 2, semester: 1, department: 'MATH', isCompulsory: true },
            { code: 'STAT2112', title: 'Statistical Inference I', credits: 2, level: 2, semester: 1, department: 'STAT', isCompulsory: true },
            { code: 'IMGT2112', title: 'Operations Management I', credits: 2, level: 2, semester: 1, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT2122', title: 'Cost & Management Accounting', credits: 2, level: 2, semester: 1, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT2132', title: 'Service Industry Concepts', credits: 2, level: 2, semester: 1, department: 'IMGT', isCompulsory: true },

            // LEVEL 2 - SEMESTER 2
            { code: 'CMIS2214', title: 'Data Structures & Analysis of Algorithms', credits: 4, level: 2, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN2213', title: 'Semiconductor Devices', credits: 3, level: 2, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN2221', title: 'Semiconductor Devices - Lab', credits: 1, level: 2, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN2232', title: 'Analogue Electronics', credits: 2, level: 2, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN2241', title: 'Analogue Electronics - Lab', credits: 1, level: 2, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'MATH2213', title: 'Linear Algebra II', credits: 3, level: 2, semester: 2, department: 'MATH', isCompulsory: true },
            { code: 'STAT2212', title: 'Design of Experiments', credits: 2, level: 2, semester: 2, department: 'STAT', isCompulsory: true },
            { code: 'STAT2222', title: 'Regression Analysis', credits: 2, level: 2, semester: 2, department: 'STAT', isCompulsory: true },
            { code: 'IMGT2212', title: 'Human Resource Management', credits: 2, level: 2, semester: 2, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT2222', title: 'Operations Research I', credits: 2, level: 2, semester: 2, department: 'IMGT', isCompulsory: true },

            // LEVEL 3 - SEMESTER 1
            { code: 'CMIS3114', title: 'Data Communication & Computer Networks', credits: 4, level: 3, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3122', title: 'Rapid Application Development', credits: 2, level: 3, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3134', title: 'Computer Architecture & Compiler Design', credits: 4, level: 3, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3142', title: 'Computational Methods', credits: 2, level: 3, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3153', title: 'Advanced Database Systems', credits: 3, level: 3, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'ELTN3113', title: 'Digital Electronics', credits: 3, level: 3, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN3121', title: 'Digital Electronics - Lab', credits: 1, level: 3, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN3133', title: 'Data Acquisition and Signal Processing', credits: 3, level: 3, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN3141', title: 'Data Acquisition and Signal Processing – Lab', credits: 1, level: 3, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'MMOD3113', title: 'Mathematical Methods', credits: 3, level: 3, semester: 1, department: 'MMOD', isCompulsory: false },
            { code: 'MMOD3124', title: 'Mathematical Models', credits: 4, level: 3, semester: 1, department: 'MMOD', isCompulsory: false },
            { code: 'STAT3112', title: 'Statistical Inference II', credits: 2, level: 3, semester: 1, department: 'STAT', isCompulsory: false },
            { code: 'STAT3124', title: 'Time Series Analysis', credits: 4, level: 3, semester: 1, department: 'STAT', isCompulsory: false },
            { code: 'IMGT3112', title: 'Operations Management II', credits: 2, level: 3, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT3122', title: 'Organization Development', credits: 2, level: 3, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT3162', title: 'Business & Industrial Law', credits: 2, level: 3, semester: 1, department: 'IMGT', isCompulsory: false },

            // LEVEL 3 - SEMESTER 2
            { code: 'CMIS3214', title: 'Software Engineering', credits: 4, level: 3, semester: 2, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3224', title: 'Web Designing and e-commerce', credits: 4, level: 3, semester: 2, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3234', title: 'Computer Graphics and Visualization', credits: 4, level: 3, semester: 2, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3242', title: 'Mobile and Ubiquitous Computing', credits: 2, level: 3, semester: 2, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3253', title: 'Data Mining', credits: 3, level: 3, semester: 2, department: 'CMIS', isCompulsory: false },
            { code: 'ELTN3212', title: 'AC Theory', credits: 2, level: 3, semester: 2, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN3222', title: 'Scientific Writing', credits: 2, level: 3, semester: 2, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN3233', title: 'Microprocessor and Microcontroller Technology', credits: 3, level: 3, semester: 2, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN3241', title: 'Microprocessor and Microcontroller Technology - Lab', credits: 1, level: 3, semester: 2, department: 'ELTN', isCompulsory: false },
            { code: 'MMOD3214', title: 'Numerical Methods', credits: 4, level: 3, semester: 2, department: 'MMOD', isCompulsory: false },
            { code: 'STAT3212', title: 'Statistical Techniques', credits: 2, level: 3, semester: 2, department: 'STAT', isCompulsory: false },
            { code: 'STAT3223', title: 'Operations Research', credits: 3, level: 3, semester: 2, department: 'STAT', isCompulsory: false },
            { code: 'STAT3232', title: 'Data Analysis & Preparation of Statistical Reports', credits: 2, level: 3, semester: 2, department: 'STAT', isCompulsory: false },
            { code: 'IMGT3212', title: 'Operations Research II', credits: 2, level: 3, semester: 2, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT3222', title: 'Management of Technology', credits: 2, level: 3, semester: 2, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT3232', title: 'International Business', credits: 2, level: 3, semester: 2, department: 'IMGT', isCompulsory: false },

            // LEVEL 4 - SEMESTER 1
            { code: 'CMIS4114', title: 'Artificial Intelligence', credits: 4, level: 4, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS4123', title: 'Advanced Operating Systems', credits: 3, level: 4, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS4134', title: 'Distributed and Cloud Computing', credits: 4, level: 4, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS4142', title: 'Image Processing', credits: 2, level: 4, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS4153', title: 'Parallel Computing', credits: 3, level: 4, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS4†18', title: 'Research Project (Special)', credits: 8, level: 4, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS4†26', title: 'Research Project (Joint Major)', credits: 6, level: 4, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN4114', title: 'Communication Theory and Systems', credits: 4, level: 4, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN4143', title: 'Programmable Logic Devices', credits: 3, level: 4, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN4151', title: 'Programmable Logic Devices - Lab', credits: 1, level: 4, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'MATH4114', title: 'Complex Variables', credits: 4, level: 4, semester: 1, department: 'MATH', isCompulsory: false },
            { code: 'STAT4114', title: 'Stochastic Processes', credits: 4, level: 4, semester: 1, department: 'STAT', isCompulsory: false },
            { code: 'STAT4134', title: 'Actuarial Mathematics', credits: 4, level: 4, semester: 1, department: 'STAT', isCompulsory: false },
            { code: 'IMGT4123', title: 'Environmental Management based on ISO 14001', credits: 3, level: 4, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT4133', title: 'Computer based Modelling & Simulation', credits: 3, level: 4, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT4142', title: 'Supply Chain Management', credits: 2, level: 4, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT4152', title: 'Productivity Techniques', credits: 2, level: 4, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT4162', title: 'Financial Management', credits: 2, level: 4, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT4172', title: 'Strategic Management', credits: 2, level: 4, semester: 1, department: 'IMGT', isCompulsory: false },

            // LEVEL 4 - SEMESTER 2
            { code: 'CMIS4216', title: 'Industrial Training (Special)', credits: 6, level: 4, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'INDT4216', title: 'Industrial Training (General/Joint Major)', credits: 6, level: 4, semester: 2, department: 'IMGT', isCompulsory: true },
            { code: 'ELTN4213', title: 'Digital Signal Processing', credits: 3, level: 4, semester: 2, department: 'ELTN', isCompulsory: false },
            { code: 'MATH4214', title: 'Partial Differential Equations', credits: 4, level: 4, semester: 2, department: 'MATH', isCompulsory: false },
            { code: 'MATH4224', title: 'Measure Theory', credits: 4, level: 4, semester: 2, department: 'MATH', isCompulsory: false },
            { code: 'IMGT4213', title: 'Advanced Marketing Management', credits: 3, level: 4, semester: 2, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT4222', title: 'Applied Econometrics', credits: 2, level: 4, semester: 2, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT4234', title: 'Advanced Operations Research', credits: 4, level: 4, semester: 2, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT4242', title: 'Strategic Business Analysis', credits: 2, level: 4, semester: 2, department: 'IMGT', isCompulsory: false }
        ];

        let created = 0;
        for (const mod of officialModules) {
            await Module.create(mod);
            created++;
            console.log(`  ✓ ${mod.code} - ${mod.title}`);
        }

        console.log(`\\n🎉 Official WUSL modules seeding completed!`);
        console.log(`\\n📊 Final Summary:`);
        console.log(`  - Total Modules Created: ${created}`);
        console.log(`\\n📋 Module Distribution:`);
        console.log(`  - Level 1 Semester 1: 11 modules`);
        console.log(`  - Level 1 Semester 2: 9 modules`);
        console.log(`  - Level 2 Semester 1: 9 modules`);
        console.log(`  - Level 2 Semester 2: 10 modules`);
        console.log(`  - Level 3 Semester 1: 16 modules`);
        console.log(`  - Level 3 Semester 2: 16 modules`);
        console.log(`  - Level 4 Semester 1: 19 modules`);
        console.log(`  - Level 4 Semester 2: 9 modules`);
        console.log(`\\n🏢 Departments:`);
        console.log(`  - CMIS: Computing & Information Systems`);
        console.log(`  - ELTN: Electronics`);
        console.log(`  - IMGT: Industrial Management`);
        console.log(`  - MATH: Mathematics`);
        console.log(`  - STAT: Statistics`);
        console.log(`  - MMOD: Mathematical Modeling`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

resetAndSeedOfficialModules();
