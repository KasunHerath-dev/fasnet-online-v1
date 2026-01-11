require('dotenv').config({ path: require('path').resolve(__dirname, '../../secure_config/.env') });
const mongoose = require('mongoose');
const Module = require('../src/models/Module');

const seedModules = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is undefined.');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Module data structure based on WUSL curriculum
        const modules = [
            // LEVEL 1 - SEMESTER 1
            { code: 'CMIS1113', title: 'Introduction to Computing', credits: 3, level: 1, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS1123', title: 'Programming Fundamentals', credits: 3, level: 1, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN1112', title: 'Basic Electronics', credits: 2, level: 1, semester: 1, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN1123', title: 'Electric Circuits I', credits: 3, level: 1, semester: 1, department: 'ELTN', isCompulsory: true },
            { code: 'IMGT1113', title: 'Principles of Management', credits: 3, level: 1, semester: 1, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT1122', title: 'Business Communication', credits: 2, level: 1, semester: 1, department: 'IMGT', isCompulsory: true },
            { code: 'MATH1112', title: 'Mathematics I', credits: 2, level: 1, semester: 1, department: 'MATH', isCompulsory: true },
            { code: 'MATH1123', title: 'Calculus I', credits: 3, level: 1, semester: 1, department: 'MATH', isCompulsory: true },
            { code: 'MATH1133', title: 'Statistics I', credits: 3, level: 1, semester: 1, department: 'MATH', isCompulsory: true },

            // LEVEL 1 - SEMESTER 2
            { code: 'CMIS1213', title: 'Data Structures', credits: 3, level: 1, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS1223', title: 'Database Management Systems', credits: 3, level: 1, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN1213', title: 'Digital Electronics', credits: 3, level: 1, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN1222', title: 'Electric Circuits II', credits: 2, level: 1, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'IMGT1213', title: 'Financial Accounting', credits: 3, level: 1, semester: 2, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT1223', title: 'Marketing Principles', credits: 3, level: 1, semester: 2, department: 'IMGT', isCompulsory: true },
            { code: 'MATH1212', title: 'Mathematics II', credits: 2, level: 1, semester: 2, department: 'MATH', isCompulsory: true },
            { code: 'MATH1223', title: 'Calculus II', credits: 3, level: 1, semester: 2, department: 'MATH', isCompulsory: true },
            { code: 'MATH1233', title: 'Statistics II', credits: 3, level: 1, semester: 2, department: 'MATH', isCompulsory: true },

            // LEVEL 2 - SEMESTER 1
            { code: 'CMIS2114', title: 'Object Oriented Programming', credits: 4, level: 2, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS2123', title: 'Computer Networks', credits: 3, level: 2, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS2133', title: 'Software Engineering I', credits: 3, level: 2, semester: 1, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN2114', title: 'Microprocessors', credits: 4, level: 2, semester: 1, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN2123', title: 'Communication Systems I', credits: 3, level: 2, semester: 1, department: 'ELTN', isCompulsory: true },
            { code: 'IMGT2113', title: 'Operations Management', credits: 3, level: 2, semester: 1, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT2124', title: 'Human Resource Management', credits: 4, level: 2, semester: 1, department: 'IMGT', isCompulsory: true },
            { code: 'MATH2113', title: 'Linear Algebra', credits: 3, level: 2, semester: 1, department: 'MATH', isCompulsory: true },
            { code: 'MATH2123', title: 'Probability Theory', credits: 3, level: 2, semester: 1, department: 'MATH', isCompulsory: true },
            { code: 'MATH2134', title: 'Statistical Methods', credits: 4, level: 2, semester: 1, department: 'MATH', isCompulsory: true },

            // LEVEL 2 - SEMESTER 2
            { code: 'CMIS2214', title: 'Web Technologies', credits: 4, level: 2, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS2223', title: 'Operating Systems', credits: 3, level: 2, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'CMIS2233', title: 'Algorithms', credits: 3, level: 2, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN2214', title: 'Embedded Systems', credits: 4, level: 2, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'ELTN2223', title: 'Communication Systems II', credits: 3, level: 2, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'IMGT2213', title: 'Financial Management', credits: 3, level: 2, semester: 2, department: 'IMGT', isCompulsory: true },
            { code: 'IMGT2224', title: 'Business Analytics', credits: 4, level: 2, semester: 2, department: 'IMGT', isCompulsory: true },
            { code: 'MATH2213', title: 'Differential Equations', credits: 3, level: 2, semester: 2, department: 'MATH', isCompulsory: true },
            { code: 'MATH2223', title: 'Mathematical Modeling', credits: 3, level: 2, semester: 2, department: 'MATH', isCompulsory: true },
            { code: 'MATH2234', title: 'Regression Analysis', credits: 4, level: 2, semester: 2, department: 'MATH', isCompulsory: true },

            // LEVEL 3 - SEMESTER 1
            { code: 'CMIS3114', title: 'Machine Learning', credits: 4, level: 3, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3124', title: 'Mobile App Development', credits: 4, level: 3, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3133', title: 'Information Security', credits: 3, level: 3, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'ELTN3114', title: 'Digital Signal Processing', credits: 4, level: 3, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN3124', title: 'VLSI Design', credits: 4, level: 3, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'IMGT3114', title: 'Strategic Management', credits: 4, level: 3, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT3123', title: 'Project Management', credits: 3, level: 3, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'MATH3114', title: 'Real Analysis', credits: 4, level: 3, semester: 1, department: 'MATH', isCompulsory: false },
            { code: 'MATH3123', title: 'Time Series Analysis', credits: 3, level: 3, semester: 1, department: 'MATH', isCompulsory: false },

            // LEVEL 3 - SEMESTER 2
            { code: 'CMIS3214', title: 'Artificial Intelligence', credits: 4, level: 3, semester: 2, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3224', title: 'Cloud Computing', credits: 4, level: 3, semester: 2, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS3233', title: 'Data Mining', credits: 3, level: 3, semester: 2, department: 'CMIS', isCompulsory: false },
            { code: 'ELTN3214', title: 'IoT Systems', credits: 4, level: 3, semester: 2, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN3223', title: 'Control Systems', credits: 3, level: 3, semester: 2, department: 'ELTN', isCompulsory: false },
            { code: 'IMGT3214', title: 'Supply Chain Management', credits: 4, level: 3, semester: 2, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT3223', title: 'Entrepreneurship', credits: 3, level: 3, semester: 2, department: 'IMGT', isCompulsory: false },
            { code: 'MATH3214', title: 'Numerical Methods', credits: 4, level: 3, semester: 2, department: 'MATH', isCompulsory: false },
            { code: 'MATH3223', title: 'Multivariate Analysis', credits: 3, level: 3, semester: 2, department: 'MATH', isCompulsory: false },

            // LEVEL 4 - SEMESTER 1
            { code: 'CMIS4114', title: 'Advanced AI', credits: 4, level: 4, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS4124', title: 'Big Data Analytics', credits: 4, level: 4, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'CMIS4133', title: 'Software Architecture', credits: 3, level: 4, semester: 1, department: 'CMIS', isCompulsory: false },
            { code: 'ELTN4114', title: 'Robotics', credits: 4, level: 4, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'ELTN4123', title: 'Wireless Networks', credits: 3, level: 4, semester: 1, department: 'ELTN', isCompulsory: false },
            { code: 'IMGT4114', title: 'Corporate Finance', credits: 4, level: 4, semester: 1, department: 'IMGT', isCompulsory: false },
            { code: 'IMGT4123', title: 'International Business', credits: 3, level: 4, semester: 1, department: 'IMGT', isCompulsory: false },

            // LEVEL 4 - SEMESTER 2
            { code: 'CMIS4218', title: 'Research Project', credits: 8, level: 4, semester: 2, department: 'CMIS', isCompulsory: true },
            { code: 'ELTN4218', title: 'Research Project', credits: 8, level: 4, semester: 2, department: 'ELTN', isCompulsory: true },
            { code: 'IMGT4218', title: 'Research Project', credits: 8, level: 4, semester: 2, department: 'IMGT', isCompulsory: true },
            { code: 'MATH4218', title: 'Research Project', credits: 8, level: 4, semester: 2, department: 'MATH', isCompulsory: true },
            { code: 'INDT4216', title: 'Industrial Training', credits: 6, level: 4, semester: 2, department: 'IMGT', isCompulsory: true }
        ];

        console.log('\\n📚 Seeding Modules...');
        let created = 0;
        let skipped = 0;

        for (const mod of modules) {
            const existing = await Module.findOne({ code: mod.code });
            if (!existing) {
                await Module.create(mod);
                created++;
                console.log(`  ✓ ${mod.code} - ${mod.title}`);
            } else {
                skipped++;
            }
        }

        console.log(`\n🎉 Module seeding completed!`);
        console.log(`\n📊 Summary:`);
        console.log(`  - Created: ${created} modules`);
        console.log(`  - Skipped: ${skipped} modules (already exist)`);
        console.log(`  - Total Modules: ${modules.length}`);
        console.log(`\n📋 Module Distribution:`);
        console.log(`  - Level 1 Semester 1: 9 modules`);
        console.log(`  - Level 1 Semester 2: 9 modules`);
        console.log(`  - Level 2 Semester 1: 10 modules`);
        console.log(`  - Level 2 Semester 2: 10 modules`);
        console.log(`  - Level 3 Semester 1: 9 modules`);
        console.log(`  - Level 3 Semester 2: 9 modules`);
        console.log(`  - Level 4 Semester 1: 7 modules`);
        console.log(`  - Level 4 Semester 2: 5 modules`);
        console.log(`\n🏢 Departments:`);
        console.log(`  - CMIS: Computing & Information Systems`);
        console.log(`  - ELTN: Electronics`);
        console.log(`  - IMGT: Industrial Management`);
        console.log(`  - MATH: Mathematics & Statistics`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding modules:', err);
        process.exit(1);
    }
};

seedModules();
