import { createAdminClient } from './supabase'

/**
 * Uploads a file to Supabase Storage
 * @param {Buffer|Uint8Array} fileBuffer - The file data as a buffer
 * @param {string} fileName - The name of the file (e.g., "avatar.png")
 * @param {string} bucketName - The Supabase storage bucket name (default: "profile-images")
 * @param {string} folder - Optional folder path within the bucket (e.g., "avatars")
 * @returns {Promise<{url: string, path: string}>} The public URL and path of the uploaded file
 */
export async function uploadToSupabase(fileBuffer, fileName, bucketName = 'profile-images', folder = '') {
  const supabase = createAdminClient()
  
  // Generate a unique filename to avoid conflicts
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const fileExtension = fileName.split('.').pop()
  const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const uniqueFileName = `${baseName}-${timestamp}-${randomString}.${fileExtension}`
  
  // Construct the file path
  const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName
  
  try {
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: `image/${fileExtension === 'png' ? 'png' : fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'jpeg' : 'webp'}`,
        upsert: false // Don't overwrite existing files
      })
    
    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`)
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)
    
    return {
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Error uploading to Supabase:', error)
    throw error
  }
}

/**
 * Uploads a base64 encoded image to Supabase Storage
 * @param {string} base64String - Base64 encoded image string (with or without data URI prefix)
 * @param {string} fileName - The desired file name (e.g., "avatar.png")
 * @param {string} bucketName - The Supabase storage bucket name
 * @param {string} folder - Optional folder path within the bucket
 * @returns {Promise<{url: string, path: string}>} The public URL and path of the uploaded file
 */
export async function uploadBase64ToSupabase(base64String, fileName, bucketName = 'profile-images', folder = '') {
  // Remove data URI prefix if present (e.g., "data:image/png;base64,")
  const base64Data = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String
  
  // Convert base64 to buffer
  const fileBuffer = Buffer.from(base64Data, 'base64')
  
  return uploadToSupabase(fileBuffer, fileName, bucketName, folder)
}
