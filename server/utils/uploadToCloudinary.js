import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - file buffer
 * @param {string} folder - folder name in Cloudinary (e.g., 'carousel')
 * @returns {Promise<string>} - secure URL of uploaded image
 */
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by its full URL
 * @param {string} imageUrl - full Cloudinary URL
 */
export const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    // Extract public_id from URL: .../upload/v123456/folder/filename.ext
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;
    // public_id is everything after 'upload/v123456/' up to the file extension
    const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExt.split('.')[0]; // remove file extension
    await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Deleted old image from Cloudinary:', publicId);
  } catch (err) {
    console.error('❌ Failed to delete image from Cloudinary:', err);
    // Do not throw; deletion failure shouldn't break the request
  }
};

export default uploadToCloudinary;