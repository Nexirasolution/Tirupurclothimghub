import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

export const runtime = 'nodejs';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Images are converted to WebP, so only these inputs are accepted.
// (SVG is deliberately NOT allowed: it can carry scripts.)
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
// Videos (e.g. reels) are stored as-is.
const VIDEO_TYPES = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };

// Note: Vercel rejects request bodies over 4.5 MB before this code even runs,
// so larger files need a direct-to-R2 (presigned URL) upload instead.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_BYTES = 4 * 1024 * 1024;

const MAX_IMAGE_WIDTH = 1600; // plenty for product pages, much smaller than camera originals
const WEBP_QUALITY = 80;

// Browsers and Cloudflare cache these forever: every upload gets a unique name
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

export async function POST(req) {
  // TODO (recommended): if only admins should upload, verify the lb_admin_token
  // cookie here the same way app/admin/layout.js does, and return 401 if invalid.
  // Customer review photos may need this route to stay public, in which case
  // add a Vercel Firewall rate-limit rule on /api/upload.

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    // Flat folder names only (no slashes or "..")
    const rawFolder = String(formData.get('folder') || 'uploads');
    const folder = /^[a-z0-9_-]{1,40}$/i.test(rawFolder) ? rawFolder : 'uploads';

    const isImage = IMAGE_TYPES.has(file.type);
    const videoExt = VIDEO_TYPES[file.type];

    if (!isImage && !videoExt) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    let body = Buffer.from(await file.arrayBuffer());
    let contentType = file.type;
    let ext = videoExt;

    if (isImage) {
      // Resize + convert once at upload time, instead of re-processing on every view.
      // .rotate() applies the phone's EXIF orientation, then strips metadata.
      body = await sharp(body)
        .rotate()
        .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      contentType = 'image/webp';
      ext = 'webp';
    }

    // Extension comes from the validated type, never from the user's file name
    const key = `${folder}/${randomUUID()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: CACHE_CONTROL,
      })
    );

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Upload failed:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}