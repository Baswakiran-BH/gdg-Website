/**
 * Test script to verify Supabase image URLs for team 2025
 * Run with: node scripts/test-supabase-urls.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');

// Load team data
const teamData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'teams', '2025.json'), 'utf8')
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not set in environment variables');
  process.exit(1);
}

console.log('✅ Supabase URL:', supabaseUrl);
console.log('\n📋 Testing filename construction...\n');

// Helper functions (same as in transformTeamData.js)
const normalizeName = (name) => name.toLowerCase().replace(/\s+/g, "");
const extractRole = (role) => {
  const words = role.toLowerCase().split(/\s+/);
  if (words.length > 2 && words[0] === "ml") {
    return words.slice(0, 3).filter(w => w !== "and").join("-");
  }
  return words[0];
};
const extractPosition = (position) => {
  const words = position.toLowerCase().split(/\s+/);
  return words[words.length - 1];
};

// Test different bucket names
const bucketNames = ["gallery-images", "gallery-image"];
const folderName = "Team_2025";

console.log('Testing with bucket names:', bucketNames.join(', '));
console.log('Folder:', folderName);
console.log('\n' + '='.repeat(80) + '\n');

teamData.members.slice(0, 10).forEach((member, index) => {
  const namePart = normalizeName(member.name);
  const rolePart = extractRole(member.role || member.position || "");
  const positionPart = extractPosition(member.position || member.role || "");
  const fileName = `${namePart}.${rolePart}.${positionPart}.png`;
  
  console.log(`${index + 1}. ${member.name}`);
  console.log(`   Role: "${member.role}", Position: "${member.position}"`);
  console.log(`   Filename: ${fileName}`);
  
  bucketNames.forEach(bucketName => {
    const url = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${folderName}/${fileName}`;
    console.log(`   ${bucketName}: ${url}`);
  });
  
  console.log('');
});

console.log('='.repeat(80));
console.log('\n💡 Next steps:');
console.log('1. Check which bucket name exists in your Supabase Storage');
console.log('2. Verify the folder name is "team_2025" (with underscore)');
console.log('3. Copy one of the URLs above and paste it in your browser to test');
console.log('4. If a URL works, note which bucket name it used');
console.log('\nIf images still don\'t load:');
console.log('- Make sure the bucket is set to PUBLIC in Supabase Storage settings');
console.log('- Verify the filenames in Supabase match exactly (case-sensitive)');

