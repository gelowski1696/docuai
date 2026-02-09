import { NextRequest, NextResponse } from 'next/server';
import { getMimeType, readFileFromStorage } from '@/lib/storage';
import path from 'path';
import { getCurrentUser } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

export function isSafeFilename(filename: string): boolean {
  if (!filename || filename.length > 255) {
    return false;
  }

  // Prevent path traversal and disallow path separators.
  if (filename !== path.basename(filename) || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Allow only conservative characters for generated filenames.
  return /^[A-Za-z0-9._-]+$/.test(filename);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename } = await params;

    if (!isSafeFilename(filename)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const document = await prisma.document.findFirst({
      where: { fileUrl: filename },
      select: { userId: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (document.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fileBuffer = await readFileFromStorage(filename);
    const contentType = getMimeType(filename);

    const isInline = request.nextUrl.searchParams.get('inline') === 'true';

    // Return file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `${isInline ? 'inline' : 'attachment'}; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}
