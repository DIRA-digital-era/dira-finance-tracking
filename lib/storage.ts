import fs from 'fs/promises';
import path from 'path';

/**
 * Storage abstraction. Local for now, but ready for S3/Cloud.
 */
export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  
  const publicDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir, { recursive: true });
  }

  const filePath = path.join(publicDir, fileName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}
