/**
 * Script to upload images to Cloudinary
 * Usage: node scripts/upload-to-cloudinary.js <image-path> <member-name>
 * 
 * Make sure to set these environment variables in .env.local:
 * CLOUDINARY_CLOUD_NAME=your-cloud-name
 * CLOUDINARY_API_KEY=your-api-key
 * CLOUDINARY_API_SECRET=your-api-secret
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Check if cloudinary package is available
let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
} catch (e) {
  console.error('❌ Cloudinary package not found. Installing...');
  console.log('Please run: npm install cloudinary');
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImage(imagePath, memberName) {
  try {
    // Validate environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Missing Cloudinary credentials in .env.local');
      console.log('\nPlease add these to .env.local:');
      console.log('CLOUDINARY_CLOUD_NAME=your-cloud-name');
      console.log('CLOUDINARY_API_KEY=your-api-key');
      console.log('CLOUDINARY_API_SECRET=your-api-secret');
      process.exit(1);
    }

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ File not found: ${imagePath}`);
      process.exit(1);
    }

    // Generate filename from member name
    const filename = memberName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const publicId = `Members/image/${filename}`;

    console.log(`\n📤 Uploading ${imagePath}...`);
    console.log(`   Public ID: ${publicId}`);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: publicId,
      folder: 'Members/image',
      overwrite: true,
      resource_type: 'image'
    });

    console.log('\n✅ Upload successful!');
    console.log(`\n📋 Use this URL in your JSON:`);
    console.log(`   "avatar": "${result.secure_url}"`);
    console.log(`\n📋 Or use this shorter version:`);
    console.log(`   "avatar": "${result.url}"`);

    return result.secure_url;

  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    if (error.http_code) {
      console.error(`   HTTP Code: ${error.http_code}`);
    }
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n📖 Usage:');
  console.log('   node scripts/upload-to-cloudinary.js <image-path> <member-name>');
  console.log('\n📝 Example:');
  console.log('   node scripts/upload-to-cloudinary.js ./photo.png "Nithin M Gowda"');
  console.log('\n💡 Make sure .env.local has Cloudinary credentials!');
  process.exit(1);
}

const [imagePath, memberName] = args;
uploadImage(imagePath, memberName);

