import { v2 as cloudinary } from 'cloudinary';

// Check if Cloudinary is properly configured with required environment variables
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Configure Cloudinary if credentials are available
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Storage abstraction. Cloudinary is required for all uploads.
 * Uploads files to Cloudinary and returns the public URL and metadata.
 */
export async function uploadFile(file: File): Promise<{ url: string; public_id: string; resource_type: string }> {
  // Ensure Cloudinary is configured before attempting upload
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary storage is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  // Convert file to base64 data URI for Cloudinary upload
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mimeType = file.type || 'application/octet-stream';
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

  try {
    // Upload to Cloudinary with automatic resource type detection
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'auto',
      folder: 'dira_uploads',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    // Return upload result with secure URL
    return {
      url: result.secure_url || result.url,
      public_id: result.public_id,
      resource_type: result.resource_type,
    };
  } catch (cloudinaryError) {
    console.error('Cloudinary upload failed:', cloudinaryError);
    throw new Error('Cloudinary upload failed. Please try again or contact system administration.');
  }
}
