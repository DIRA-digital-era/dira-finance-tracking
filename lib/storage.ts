import fs from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Storage abstraction. Uses Cloudinary when configured, otherwise falls back to local storage.
 */
export async function uploadFile(file: File): Promise<{ url: string; public_id: string; resource_type: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (useCloudinary) {
    try {
      const mimeType = file.type || 'application/octet-stream';
      const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: 'auto',
        folder: 'dira_uploads',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });

      return {
        url: result.secure_url || result.url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      };
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      // Fall through to local storage
    }
  }

  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const publicDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir, { recursive: true });
  }

  const filePath = path.join(publicDir, fileName);
  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${fileName}`,
    public_id: `local-${fileName}`,
    resource_type: file.type || 'unknown',
  };
}
