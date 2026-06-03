import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../config/logger';

const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder_cloud_name' &&
  process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'placeholder_api_key' &&
  process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'placeholder_api_secret';

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('☁️ Cloudinary integration configured successfully.');
} else {
  logger.warn('⚠️ Cloudinary is running in MOCK mode. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env for live uploads.');
}

/**
 * Uploads a file buffer directly to Cloudinary using streams.
 * Falls back to a mock URL if credentials are not configured.
 */
export const uploadToCloudinary = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      // Graceful fallback for local development without credentials
      logger.info('Cloudinary [MOCK]: Simulating image upload...');
      setTimeout(() => {
        // Return a random beautiful clothing photo from Unsplash
        const mockUrls = [
          'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80',
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
        ];
        const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
        logger.info(`Cloudinary [MOCK]: Upload simulated successfully. Returned: ${randomUrl}`);
        resolve(randomUrl);
      }, 600);
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'pistasien',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          return reject(new Error('Cloudinary upload failed: ' + error.message));
        }
        if (!result) {
          return reject(new Error('Cloudinary upload failed: no result returned'));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Extracts public ID from a Cloudinary URL and deletes the asset from Cloudinary.
 */
export const deleteFromCloudinary = async (url: string): Promise<void> => {
  if (!isConfigured) {
    logger.info(`Cloudinary [MOCK]: Skipping asset destruction for ${url}`);
    return;
  }

  try {
    // Cloudinary URLs contain /upload/v<version>/<folder>/<public_id>.<ext>
    const parts = url.split('/upload/');
    if (parts.length < 2) return;

    // Remove the version segment (e.g. v12345678) and file extension
    const pathAfterUpload = parts[1].replace(/^v\d+\//, '');
    const publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.')) || pathAfterUpload;

    logger.info(`Cloudinary: Attempting to delete public ID "${publicId}"`);
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary delete result for "${publicId}":`, result);
  } catch (error) {
    logger.error('Failed to delete image from Cloudinary:', error);
  }
};
