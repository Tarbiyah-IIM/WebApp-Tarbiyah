import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './error.middleware.js';
import { findUserById } from '../models/user.model.js';
import { isAccessTokenRevoked } from '../utils/tokenRevocation.js';

export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Token autentikasi tidak ditemukan'));
    }

    const token = authHeader.slice(7).trim();
    const payload = jwt.verify(token, env.jwt.accessSecret, { algorithms: ['HS256'] });
    const subjectId = Number(payload?.sub);
    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return next(new AppError(401, 'INVALID_TOKEN', 'Token tidak valid atau telah kedaluwarsa'));
    }
    if (isAccessTokenRevoked(subjectId, payload?.iat)) {
      return next(new AppError(401, 'INVALID_TOKEN', 'Token tidak valid atau telah kedaluwarsa'));
    }

    const user = await findUserById(subjectId);

    if (!user || !user.is_active) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Akun tidak aktif atau tidak ditemukan'));
    }

    req.user = user;
    return next();
  } catch {
    return next(new AppError(401, 'INVALID_TOKEN', 'Token tidak valid atau telah kedaluwarsa'));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Silakan login terlebih dahulu'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'Anda tidak memiliki akses ke fitur ini'));
    }
    return next();
  };
}
