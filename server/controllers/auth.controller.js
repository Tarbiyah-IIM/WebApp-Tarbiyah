import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/error.middleware.js';
import {
  createPasswordReset,
  createUser,
  deleteUserById,
  findUserByEmail,
  findUserById,
  findValidPasswordReset,
  findValidRefreshToken,
  markPasswordResetUsed,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  storeRefreshToken,
  updateUserPassword,
  updateUserProfile
} from '../models/user.model.js';

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function issueAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

async function issueAndStoreRefreshToken(user) {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000);
  await storeRefreshToken({ userId: user.id, tokenHash, expiresAt });
  return { rawToken, expiresAt };
}

function setRefreshCookie(res, rawToken, expiresAt) {
  res.cookie('tarbiyah_refresh', rawToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    expires: expiresAt,
    path: '/api/v1/auth'
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return next(new AppError(409, 'EMAIL_EXISTS', 'Email sudah terdaftar'));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;
    const user = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'student',
      avatarUrl
    });

    const accessToken = issueAccessToken(user);
    const { rawToken, expiresAt } = await issueAndStoreRefreshToken(user);
    setRefreshCookie(res, rawToken, expiresAt);

    return res.status(201).json({
      accessToken,
      user
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const userRow = await findUserByEmail(normalizedEmail);

    if (!userRow || !userRow.is_active) {
      return next(new AppError(401, 'INVALID_CREDENTIALS', 'Email atau password salah'));
    }

    const match = await bcrypt.compare(password, userRow.password_hash);
    if (!match) {
      return next(new AppError(401, 'INVALID_CREDENTIALS', 'Email atau password salah'));
    }

    const safeUser = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      avatar_url: userRow.avatar_url,
      bio: userRow.bio,
      is_active: userRow.is_active,
      created_at: userRow.created_at
    };

    const accessToken = issueAccessToken(safeUser);
    const { rawToken, expiresAt } = await issueAndStoreRefreshToken(safeUser);
    setRefreshCookie(res, rawToken, expiresAt);

    return res.json({
      accessToken,
      user: safeUser
    });
  } catch (err) {
    return next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const rawCookie = req.cookies?.tarbiyah_refresh;
    if (!rawCookie) {
      return next(new AppError(401, 'NO_REFRESH_TOKEN', 'Sesi login telah berakhir'));
    }

    const tokenHash = hashToken(rawCookie);
    const stored = await findValidRefreshToken(tokenHash);
    if (!stored) {
      res.clearCookie('tarbiyah_refresh', { path: '/api/v1/auth' });
      return next(new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token tidak valid'));
    }

    const user = await findUserById(stored.user_id);
    if (!user || !user.is_active) {
      await revokeRefreshToken(tokenHash);
      res.clearCookie('tarbiyah_refresh', { path: '/api/v1/auth' });
      return next(new AppError(401, 'UNAUTHORIZED', 'Akun tidak aktif'));
    }

    await revokeRefreshToken(tokenHash);
    const accessToken = issueAccessToken(user);
    const { rawToken, expiresAt } = await issueAndStoreRefreshToken(user);
    setRefreshCookie(res, rawToken, expiresAt);

    return res.json({
      accessToken,
      user
    });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const rawCookie = req.cookies?.tarbiyah_refresh;
    if (rawCookie) {
      await revokeRefreshToken(hashToken(rawCookie));
    }
    res.clearCookie('tarbiyah_refresh', { path: '/api/v1/auth' });
    return res.json({ message: 'Logout berhasil' });
  } catch (err) {
    return next(err);
  }
}

const ADMIN_RECOVERY_EMAIL = 'iimtarbiyah20232@gmail.com';
const ADMIN_ACCOUNT_EMAIL = 'tarbiyah@iim.ac.id';

export async function forgotPassword(req, res, next) {
  try {
    const normalizedEmail = req.body.email.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_RECOVERY_EMAIL) {
      return next(
        new AppError(
          400,
          'INVALID_RECOVERY_EMAIL',
          'Email pemulihan salah. Masukkan email admin yang terdaftar.'
        )
      );
    }

    const user = await findUserByEmail(ADMIN_ACCOUNT_EMAIL);
    if (!user || !user.is_active) {
      return next(new AppError(404, 'ADMIN_NOT_FOUND', 'Akun admin tidak ditemukan atau tidak aktif'));
    }

    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await createPasswordReset({ userId: user.id, tokenHash, expiresAt });

    const sandboxResetToken = env.nodeEnv !== 'production' ? rawToken : null;

    return res.json({
      message: 'Token pemulihan password admin berhasil dibuat.',
      ...(sandboxResetToken ? { sandboxResetToken } : {})
    });
  } catch (err) {
    return next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const tokenHash = hashToken(token.trim());
    const resetRow = await findValidPasswordReset(tokenHash);

    if (!resetRow) {
      return next(new AppError(400, 'INVALID_RESET_TOKEN', 'Token pemulihan tidak valid atau kedaluwarsa'));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(resetRow.user_id, passwordHash);
    await markPasswordResetUsed(resetRow.id);
    await revokeAllUserRefreshTokens(resetRow.user_id);

    return res.json({ message: 'Password berhasil diperbarui. Silakan login kembali.' });
  } catch (err) {
    return next(err);
  }
}

export async function getMe(req, res) {
  return res.json({ user: req.user });
}

export async function updateMe(req, res, next) {
  try {
    const { name, avatarUrl, bio, newPassword } = req.body;
    const updated = await updateUserProfile(req.user.id, {
      name: name ? name.trim() : req.user.name,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : req.user.avatar_url,
      bio: bio !== undefined ? bio : req.user.bio
    });

    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      await updateUserPassword(req.user.id, hash);
    }

    return res.json({ user: updated });
  } catch (err) {
    return next(err);
  }
}

export async function deleteMe(req, res, next) {
  try {
    await deleteUserById(req.user.id);
    res.clearCookie('tarbiyah_refresh', { path: '/api/v1/auth' });
    return res.json({ message: 'Akun dan data terkait berhasil dihapus' });
  } catch (err) {
    return next(err);
  }
}
