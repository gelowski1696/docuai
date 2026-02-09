import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

/**
 * File Storage Utilities
 *
 * PostgreSQL mode: Supabase Storage bucket (Vercel-safe, persistent)
 * SQLite mode: local filesystem (/uploads)
 */

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const USE_SUPABASE_STORAGE = process.env.DATABASE_PROVIDER === 'postgresql';
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'documents';
let bucketChecked = false;

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'pdf':
      return 'application/pdf';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
}

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for Supabase Storage');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function ensureSupabaseBucket() {
  if (bucketChecked) return;

  const supabase = getSupabaseAdminClient();
  const { error: getError } = await supabase.storage.getBucket(SUPABASE_BUCKET);

  if (getError) {
    const { error: createError } = await supabase.storage.createBucket(SUPABASE_BUCKET, {
      public: false,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
    });

    if (createError && !createError.message.toLowerCase().includes('already')) {
      throw createError;
    }
  }

  bucketChecked = true;
}

/**
 * Ensure uploads directory exists
 */
async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Save a file buffer to the uploads directory
 * Returns the filename
 */
export async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  if (USE_SUPABASE_STORAGE) {
    await ensureSupabaseBucket();

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filename, buffer, {
        contentType: getContentType(filename),
        upsert: true,
      });

    if (error) {
      throw error;
    }

    return filename;
  }

  await ensureUploadsDir();
  
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.writeFile(filePath, buffer);
  
  return filename;
}

/**
 * Get the public URL for a file
 * In production, this would return an S3 URL or similar
 */
export function getFileUrl(filename: string): string {
  return `/api/files/${encodeURIComponent(filename)}`;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(filename: string): Promise<void> {
  if (USE_SUPABASE_STORAGE) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([filename]);
    if (error) {
      console.error('Error deleting file from Supabase Storage:', error);
    }
    return;
  }

  const filePath = path.join(UPLOADS_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

/**
 * Read file contents from storage
 */
export async function readFileFromStorage(filename: string): Promise<Buffer> {
  if (USE_SUPABASE_STORAGE) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).download(filename);
    if (error) {
      throw error;
    }

    const fileBytes = await data.arrayBuffer();
    return Buffer.from(fileBytes);
  }

  const filePath = path.join(UPLOADS_DIR, filename);
  return fs.readFile(filePath);
}

/**
 * Get content type for serving
 */
export function getMimeType(filename: string): string {
  return getContentType(filename);
}

/**
 * Get file path for serving (local mode only)
 */
export function getFilePath(filename: string): string {
  return path.join(UPLOADS_DIR, filename);
}

/**
 * Generate a unique filename
 */
export function generateFilename(userId: string, templateType: string, format: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}-${templateType}-${timestamp}-${random}.${format.toLowerCase()}`;
}
