import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { AppError } from './error.middleware.js';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeToExt = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = allowedMimeToExt[file.mimetype] || '.png';
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeToExt[file.mimetype]) {
      return cb(new AppError(400, 'INVALID_FILE_TYPE', 'Hanya gambar JPG, PNG, WebP, atau GIF yang diizinkan'));
    }
    return cb(null, true);
  }
});
