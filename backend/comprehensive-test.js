const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api/v1';
const FRONTEND_URL = 'http://localhost:3001';

async function runComprehensiveTests() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     COMPREHENSIVE SYSTEM VERIFICATION REPORT          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Connect to database for verification
    await mongoose.connect('mongodb://localhost:27017/fas_db');
    const Student = require('./src/models/Student');
    const User = require('./src/models/User');

    // Test 1: Admin Login
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1: Admin Login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'Admin@123'
        });

        if (response.data.token && response.data.user.roles.includes('superadmin')) {
            console.log('✅ PASS: Admin login successful');
            console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
            console.log(`   User: ${response.data.user.username}`);
            console.log(`   Roles: ${response.data.user.roles.join(', ')}`);
            results.passed++;
            results.tests.push({ name: 'Admin Login', status: 'PASS' });

            // Save admin token for later tests
            global.adminToken = response.data.token;
        } else {
            throw new Error('Invalid response structure');
        }
    } catch (error) {
        console.log('❌ FAIL: Admin login failed');
        console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
        results.failed++;
        results.tests.push({ name: 'Admin Login', status: 'FAIL', error: error.message });
    }
    console.log('');

    // Test 2: Student Login
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2: Student Login (Registration Number as Username)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
        const sampleStudent = await Student.findOne({ userRef: { $exists: true } }).populate('userRef');
        const username = sampleStudent.userRef.username;

        const response = await axios.post(`${BASE_URL}/auth/login`, {
            username: username,
            password: 'abc123'
        });

        if (response.data.token && response.data.user.roles.includes('user')) {
            console.log('✅ PASS: Student login successful');
            console.log(`   Student: ${sampleStudent.fullName}`);
            console.log(`   Registration: ${sampleStudent.registrationNumber}`);
            console.log(`   Username: ${username}`);
            console.log(`   Password: abc123 (default)`);
            console.log(`   Roles: ${response.data.user.roles.join(', ')}`);
            results.passed++;
            results.tests.push({ name: 'Student Login', status: 'PASS' });

            global.studentToken = response.data.token;
            global.studentUser = response.data.user;
        } else {
            throw new Error('Invalid response structure');
        }
    } catch (error) {
        console.log('❌ FAIL: Student login failed');
        console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
        results.failed++;
        results.tests.push({ name: 'Student Login', status: 'FAIL', error: error.message });
    }
    console.log('');

    // Test 3: System Users API (Admin Only)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3: System Users API (Admin Access)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
        const response = await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${global.adminToken}` }
        });

        if (response.data.users && response.data.users.length > 0) {
            console.log('✅ PASS: System Users API accessible by admin');
            console.log(`   Total Users: ${response.data.users.length}`);
            console.log(`   Admin Users: ${response.data.users.filter(u => u.roles.includes('admin') || u.roles.includes('superadmin')).length}`);
            console.log(`   Student Users: ${response.data.users.filter(u => u.roles.includes('user')).length}`);
            results.passed++;
            results.tests.push({ name: 'System Users API', status: 'PASS' });
        } else {
            throw new Error('No users returned');
        }
    } catch (error) {
        console.log('❌ FAIL: System Users API failed');
        console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
        results.failed++;
        results.tests.push({ name: 'System Users API', status: 'FAIL', error: error.message });
    }
    console.log('');

    // Test 4: Student Cannot Access Admin Endpoints
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 4: Role-Based Access Control (Student → Admin Endpoint)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
        await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${global.studentToken}` }
        });
        console.log('❌ FAIL: Student should NOT access admin endpoints');
        results.failed++;
        results.tests.push({ name: 'Role-Based Access Control', status: 'FAIL', error: 'Student accessed admin endpoint' });
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('✅ PASS: Student correctly blocked from admin endpoints');
            console.log(`   Status: 403 Forbidden`);
            results.passed++;
            results.tests.push({ name: 'Role-Based Access Control', status: 'PASS' });
        } else {
            console.log('❌ FAIL: Unexpected error');
            console.log(`   Error: ${error.message}`);
            results.failed++;
            results.tests.push({ name: 'Role-Based Access Control', status: 'FAIL', error: error.message });
        }
    }
    console.log('');

    // Test 5: Database Verification
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 5: Database Integrity');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
        const totalStudents = await Student.countDocuments();
        const studentsWithAccounts = await Student.countDocuments({ userRef: { $exists: true, $ne: null } });
        const totalUsers = await User.countDocuments();

        console.log(`   Total Students: ${totalStudents}`);
        console.log(`   Students with Accounts: ${studentsWithAccounts}`);
        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   Coverage: ${((studentsWithAccounts / totalStudents) * 100).toFixed(1)}%`);

        if (studentsWithAccounts === totalStudents) {
            console.log('✅ PASS: All students have user accounts');
            results.passed++;
            results.tests.push({ name: 'Database Integrity', status: 'PASS' });
        } else {
            console.log(`❌ FAIL: ${totalStudents - studentsWithAccounts} students missing accounts`);
            results.failed++;
            results.tests.push({ name: 'Database Integrity', status: 'FAIL', error: 'Missing accounts' });
        }
    } catch (error) {
        console.log('❌ FAIL: Database check failed');
        console.log(`   Error: ${error.message}`);
        results.failed++;
        results.tests.push({ name: 'Database Integrity', status: 'FAIL', error: error.message });
    }
    console.log('');

    // Test 6: Password Validation
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 6: Default Password Verification');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
        const testStudents = await Student.find({ userRef: { $exists: true } }).populate('userRef').limit(3);
        let allCorrect = true;

        for (const student of testStudents) {
            const isCorrect = await student.userRef.comparePassword('abc123');
            console.log(`   ${student.fullName}: ${isCorrect ? '✅' : '❌'}`);
            if (!isCorrect) allCorrect = false;
        }

        if (allCorrect) {
            console.log('✅ PASS: Default password "abc123" set correctly');
            results.passed++;
            results.tests.push({ name: 'Default Password', status: 'PASS' });
        } else {
            console.log('❌ FAIL: Some students have incorrect passwords');
            results.failed++;
            results.tests.push({ name: 'Default Password', status: 'FAIL', error: 'Incorrect passwords' });
        }
    } catch (error) {
        console.log('❌ FAIL: Password verification failed');
        console.log(`   Error: ${error.message}`);
        results.failed++;
        results.tests.push({ name: 'Default Password', status: 'FAIL', error: error.message });
    }
    console.log('');

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    results.tests.forEach((test, index) => {
        const status = test.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
        console.log(`${index + 1}. ${test.name}: ${status}`);
        if (test.error) {
            console.log(`   Error: ${test.error}`);
        }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (results.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! System is fully functional.\n');
    } else {
        console.log('⚠️  Some tests failed. Please review the errors above.\n');
    }

    await mongoose.connection.close();
    process.exit(results.failed > 0 ? 1 : 0);
}

// Check if axios is available
try {
    runComprehensiveTests().catch(error => {
        console.error('Test suite error:', error.message);
        process.exit(1);
    });
} catch (error) {
    console.error('Failed to start tests:', error.message);
    console.log('\nNote: This test requires axios. Install it with: npm install axios');
    process.exit(1);
}
