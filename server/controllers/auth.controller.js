import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { withTransaction } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/error.middleware.js';
import { isTrustedMutationOrigin } from '../utils/security.js';
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

const DUMMY_PASSWORD_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function issueAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn, algorithm: 'HS256' }
  );
}

async function issueAndStoreRefreshToken(user, executor) {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000);
  await storeRefreshToken({ userId: user.id, tokenHash, expiresAt }, executor);
  return { rawToken, expiresAt };
}

function buildRefreshCookieOptions(expiresAt = null) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/api/v1/auth',
    ...(expiresAt ? { expires: expiresAt } : {})
  };
}

function setRefreshCookie(res, rawToken, expiresAt) {
  res.cookie('tarbiyah_refresh', rawToken, buildRefreshCookieOptions(expiresAt));
}

function clearRefreshCookie(res) {
  res.clearCookie('tarbiyah_refresh', buildRefreshCookieOptions());
}

export async function register(req, res, next) {
  try {
    if (!env.allowPublicRegister) {
      return next(new AppError(403, 'REGISTRATION_DISABLED', 'Pendaftaran akun publik dinonaktifkan'));
    }
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
    const match = await bcrypt.compare(password, userRow?.password_hash || DUMMY_PASSWORD_HASH);

    if (!userRow || !userRow.is_active || !match) {
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
    if (!isTrustedMutationOrigin(req, env.clientOrigins, { isProduction: env.nodeEnv === 'production' })) {
      return next(new AppError(403, 'CSRF_ORIGIN_REJECTED', 'Origin permintaan tidak diizinkan'));
    }

    const rawCookie = req.cookies?.tarbiyah_refresh;
    if (!rawCookie) {
      return next(new AppError(401, 'NO_REFRESH_TOKEN', 'Sesi login telah berakhir'));
    }

    const tokenHash = hashToken(rawCookie);
    const stored = await findValidRefreshToken(tokenHash);
    if (!stored) {
      return next(new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token tidak valid'));
    }

    const user = await findUserById(stored.user_id);
    if (!user || !user.is_active) {
      await revokeRefreshToken(tokenHash);
      clearRefreshCookie(res);
      return next(new AppError(401, 'UNAUTHORIZED', 'Akun tidak aktif'));
    }

    const rotated = await withTransaction(async (conn) => {
      const revoked = await revokeRefreshToken(tokenHash, conn);
      if (!revoked) {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token sudah digunakan atau kedaluwarsa');
      }
      const nextAccessToken = issueAccessToken(user);
      const nextRefresh = await issueAndStoreRefreshToken(user, conn);
      return { accessToken: nextAccessToken, ...nextRefresh };
    });

    setRefreshCookie(res, rotated.rawToken, rotated.expiresAt);

    return res.json({
      accessToken: rotated.accessToken,
      user
    });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res, next) {
  try {
    if (!isTrustedMutationOrigin(req, env.clientOrigins, { isProduction: env.nodeEnv === 'production' })) {
      return next(new AppError(403, 'CSRF_ORIGIN_REJECTED', 'Origin permintaan tidak diizinkan'));
    }

    const rawCookie = req.cookies?.tarbiyah_refresh;
    if (rawCookie) {
      await revokeRefreshToken(hashToken(rawCookie));
    }
    clearRefreshCookie(res);
    return res.json({ message: 'Logout berhasil' });
  } catch (err) {
    return next(err);
  }
}

const ADMIN_RECOVERY_EMAIL = 'iimtarbiyah20232@gmail.com';
const ADMIN_ACCOUNT_EMAIL = 'tarbiyah@iim.ac.id';

export async function forgotPassword(req, res, next) {
  try {
    if (!env.allowSandboxReset) {
      return next(
        new AppError(
          503,
          'AUTH_RECOVERY_UNAVAILABLE',
          'Layanan pemulihan password via email belum diaktifkan pada server ini. Hubungi administrator hosting untuk reset kredensial.'
        )
      );
    }

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

    return res.json({
      message: 'Token pemulihan password admin berhasil dibuat.',
      sandboxResetToken: rawToken
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

    const resetUser = await findUserById(resetRow.user_id);
    if (!resetUser || !resetUser.is_active) {
      return next(new AppError(400, 'INVALID_RESET_TOKEN', 'Token pemulihan tidak valid atau kedaluwarsa'));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await withTransaction(async (conn) => {
      const consumed = await markPasswordResetUsed(resetRow.id, conn);
      if (!consumed) {
        throw new AppError(400, 'INVALID_RESET_TOKEN', 'Token pemulihan sudah digunakan atau kedaluwarsa');
      }
      await updateUserPassword(resetRow.user_id, passwordHash, conn);
      await revokeAllUserRefreshTokens(resetRow.user_id, conn);
    });

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
    const { name, avatarUrl, bio, currentPassword, newPassword } = req.body;
    if (newPassword) {
      const userWithPassword = await findUserByEmail(req.user.email);
      const validCurrent =
        Boolean(currentPassword) &&
        Boolean(userWithPassword?.password_hash) &&
        (await bcrypt.compare(currentPassword, userWithPassword.password_hash));
      if (!validCurrent) {
        return next(new AppError(400, 'INVALID_CURRENT_PASSWORD', 'Password saat ini tidak sesuai'));
      }
    }

    const updated = await withTransaction(async (conn) => {
      const profile = await updateUserProfile(
        req.user.id,
        {
          name: name ? name.trim() : req.user.name,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : req.user.avatar_url,
          bio: bio !== undefined ? bio : req.user.bio
        },
        conn
      );

      if (newPassword) {
        const hash = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(req.user.id, hash, conn);
        await revokeAllUserRefreshTokens(req.user.id, conn);
      }

      return profile;
    });

    return res.json({ user: updated });
  } catch (err) {
    return next(err);
  }
}

export async function deleteMe(req, res, next) {
  try {
    if (req.user.role === 'admin') {
      return next(
        new AppError(403, 'ADMIN_SELF_DELETE_FORBIDDEN', 'Akun administrator tidak dapat dihapus melalui profil sendiri')
      );
    }
    await deleteUserById(req.user.id);
    clearRefreshCookie(res);
    return res.json({ message: 'Akun dan data terkait berhasil dihapus' });
  } catch (err) {
    return next(err);
  }
}
