const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const bucketName = process.env.SUPABASE_BUCKET || 'lms-materials';

async function testConnection() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey?.substring(0, 15) + '...');
    console.log('Bucket:', bucketName);

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to list buckets as a basic connectivity test
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
        console.error('❌ Failed to connect to Supabase storage:', bucketError.message);
        return;
    }

    console.log('✅ Connected to Supabase Storage. Available buckets:', buckets.map(b => b.name));

    let bucketExists = buckets.find(b => b.name === bucketName);
    
    if (!bucketExists) {
        console.log(`⚠️  Bucket "${bucketName}" not found. Attempting to create it...`);
        const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true
        });

        if (createError) {
            console.error('❌ Failed to create bucket:', createError.message);
            if (createError.message.includes('403') || createError.message.toLowerCase().includes('permission denied')) {
                console.error('\n🚨 PERMISSION DENIED: Your key (publishable) does not have permission to create buckets.');
                console.error('👉 You MUST use the "service_role" key for backend operations.');
            }
            return;
        }
        console.log('✅ Bucket created successfully!');
        bucketExists = true;
    }

    // Try a test upload
    console.log(`\nTesting upload to "${bucketName}"...`);
    const testContent = 'Hello from FASNET Migration Test';
    const filePath = `test_connection_${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, testContent, {
            contentType: 'text/plain',
            upsert: true
        });

    if (uploadError) {
        console.error('❌ Upload failed:', uploadError.message);
        return;
    }

    console.log('✅ Upload successful!', uploadData);

    // Try to get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    console.log('✅ Public URL generated:', publicUrl);

    // Clean up
    console.log('\nCleaning up test file...');
    const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

    if (deleteError) {
        console.warn('⚠️  Could not delete test file:', deleteError.message);
    } else {
        console.log('✅ Test file cleaned up.');
    }

    console.log('\n🌟 Supabase configuration is CORRECT and ready for migration!');
}

testConnection();
