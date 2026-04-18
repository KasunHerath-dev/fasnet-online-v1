import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORAGE      = process.env.ATTACHMENT_STORAGE || 'local';
const LOCAL_DIR    = process.env.ATTACHMENT_LOCAL_DIR || './attachments';

// ── Storage drivers ───────────────────────────────────────────────────────────

const drivers = {
  // ── Local disk ──────────────────────────────────────────────────────────────
  local: {
    async save(buffer, filename, _mimeType) {
      fs.mkdirSync(LOCAL_DIR, { recursive: true });
      const dest = path.join(LOCAL_DIR, filename);
      fs.writeFileSync(dest, buffer);
      // Return a URL your Express backend can serve
      // Add a route:  app.use('/attachments', express.static('./scraper/attachments'))
      return `/attachments/${filename}`;
    },
  },

  // ── AWS S3 / S3-compatible (R2, MinIO, etc.) ────────────────────────────────
  s3: {
    async save(buffer, filename, mimeType) {
      // Lazy import — only loads if ATTACHMENT_STORAGE=s3
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

      const client = new S3Client({
        region:   process.env.S3_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT,           // optional for R2/MinIO
        credentials: {
          accessKeyId:     process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
      });

      const key = `notices/attachments/${filename}`;
      await client.send(new PutObjectCommand({
        Bucket:      process.env.S3_BUCKET,
        Key:         key,
        Body:        buffer,
        ContentType: mimeType,
        ACL:         'public-read',
      }));

      const endpoint = process.env.S3_ENDPOINT
        ? `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`
        : `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`;

      return `${endpoint}/${key}`;
    },
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Download a file from a URL and store it via the configured driver.
 * Returns an attachment object ready to embed in the Notice document.
 */
export async function downloadAttachment({ href, text }) {
  try {
    const response = await axios.get(href, {
      responseType: 'arraybuffer',
      timeout: 30_000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const buffer    = Buffer.from(response.data);
    const mimeType  = response.headers['content-type'] || 'application/octet-stream';
    const ext       = extensionFromMime(mimeType) || path.extname(href) || '.bin';
    const hash      = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);
    const safeName  = slugify(text || path.basename(href, ext)) + `-${hash}` + ext;

    const driver    = drivers[STORAGE] ?? drivers.local;
    const storedUrl = await driver.save(buffer, safeName, mimeType);

    console.log(`[attachments] Saved ${safeName} via ${STORAGE}`);

    return {
      originalName: text || path.basename(href),
      originalUrl:  href,
      storedUrl,
      mimeType,
      sizeBytes: buffer.length,
    };
  } catch (err) {
    console.error(`[attachments] Failed to download ${href}: ${err.message}`);
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function extensionFromMime(mime) {
  const map = {
    'application/pdf':                                          '.pdf',
    'application/msword':                                       '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel':                                 '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/zip':                                          '.zip',
    'text/plain':                                               '.txt',
    'text/csv':                                                 '.csv',
  };
  return map[mime.split(';')[0].trim()] ?? '';
}
