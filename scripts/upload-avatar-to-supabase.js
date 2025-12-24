/**
 * Script to upload avatar images to Supabase Storage
 * Usage: node scripts/upload-avatar-to-supabase.js <image-path> <profile-id> [bucket-name] [folder]
 * 
 * Example:
 *   node scripts/upload-avatar-to-supabase.js ./avatar.png 1
 *   node scripts/upload-avatar-to-supabase.js ./avatar.png 1 profile-images avatars
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function uploadAvatar(imagePath, profileId, bucketName = 'profile-images', folder = 'avatars') {
  // Import Prisma
  const prismaModule = require('../lib/prisma');
  const prisma = prismaModule.default || prismaModule;

  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('\n❌ Error: Missing Supabase environment variables');
      console.log('Please ensure your .env file has:');
      console.log('  NEXT_PUBLIC_SUPABASE_URL');
      console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for admin access)');
      process.exit(1);
    }

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`\n❌ Error: File not found: ${imagePath}`);
      process.exit(1);
    }

    // Read the image file
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Validate file type
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)) {
      console.error(`\n❌ Error: Unsupported file type. Please use PNG, JPG, or WEBP.`);
      process.exit(1);
    }

    console.log(`\n📤 Uploading ${fileName} to Supabase...`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const uniqueFileName = `${baseName}-${timestamp}-${randomString}.${fileExtension}`;
    const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    // Upload to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('✅ Upload successful!');
    console.log(`   URL: ${urlData.publicUrl}`);
    console.log(`   Path: ${filePath}`);

    // Update the profile in the database
    console.log(`\n🔄 Updating profile ${profileId}...`);
    const updatedProfile = await prisma.profile.update({
      where: { id: parseInt(profileId) },
      data: { image: urlData.publicUrl },
    });

    console.log('✅ Profile updated successfully!');
    console.log(`\n📋 Summary:`);
    console.log(`   Profile ID: ${profileId}`);
    console.log(`   Profile Name: ${updatedProfile.name}`);
    console.log(`   Image URL: ${urlData.publicUrl}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('\n❌ Error: Missing required arguments');
  console.log('\n📖 Usage:');
  console.log('   node scripts/upload-avatar-to-supabase.js <image-path> <profile-id> [bucket-name] [folder]');
  console.log('\n📝 Example:');
  console.log('   node scripts/upload-avatar-to-supabase.js ./avatar.png 1');
  console.log('   node scripts/upload-avatar-to-supabase.js ./avatar.png 1 profile-images avatars');
  console.log('\n💡 Make sure your .env file has Supabase credentials!');
  process.exit(1);
}

const [imagePath, profileId, bucketName, folder] = args;

uploadAvatar(imagePath, profileId, bucketName, folder);