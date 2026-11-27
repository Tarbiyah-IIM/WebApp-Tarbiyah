import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { test as base, expect } from '@playwright/test';

dotenv.config({ quiet: true });

const testDatabaseName = process.env.E2E_DB_NAME || 'u104886200_tarbiyah_iim_test';

if (!/_test$/.test(testDatabaseName)) {
  throw new Error(
    `[playwright] Isolasi admin uji wajib memakai database berakhiran _test (sekarang: ${testDatabaseName}).`
  );
}

async function openTestDbConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: testDatabaseName
  });
}

async function insertIsolatedAdmin(name = 'E2E Isolated Admin') {
  const email = `e2e.admin.${Date.now()}.${crypto.randomBytes(3).toString('hex')}@tarbiyah.test`;
  const password = `Adm!${crypto.randomBytes(12).toString('hex')}`;
  const passwordHash = await bcrypt.hash(password, 10);
  const conn = await openTestDbConnection();
  try {
    const [result] = await conn.execute(
      "INSERT INTO users (name, email, password_hash, role, avatar_url, is_active) VALUES (?, ?, ?, 'admin', NULL, 1)",
      [name, email, passwordHash]
    );
    return { id: result.insertId, email, password };
  } finally {
    await conn.end();
  }
}

async function deleteIsolatedAdmins(ids) {
  if (!ids.length) return;
  const conn = await openTestDbConnection();
  try {
    for (const id of ids) {
      await conn.execute('DELETE FROM admin_audit_log WHERE actor_id = ?', [id]).catch(() => {});
      await conn.execute('DELETE FROM users WHERE id = ?', [id]);
    }
  } finally {
    await conn.end();
  }
}

export const test = base.extend({
  createIsolatedAdmin: async ({}, use) => {
    const createdIds = [];
    const fn = async (name = 'E2E Isolated Admin') => {
      const admin = await insertIsolatedAdmin(name);
      createdIds.push(admin.id);
      return admin;
    };
    await use(fn);
    await deleteIsolatedAdmins(createdIds);
  },
  loginViaApi: async ({ page, request }, use) => {
    const createdIds = [];
    const fn = async () => {
      const { id, email, password } = await insertIsolatedAdmin();
      createdIds.push(id);
      const res = await request.post('http://localhost:3001/api/v1/auth/login', {
        data: { email, password }
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      await page.goto('/login');
      await page.evaluate(
        async ({ loginEmail, loginPassword }) => {
          await fetch('/api/v1/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, password: loginPassword })
          });
          window.localStorage.setItem('tarbiyah_has_session', '1');
        },
        { loginEmail: email, loginPassword: password }
      );
      return { ...body, email, password };
    };
    await use(fn);
    await deleteIsolatedAdmins(createdIds);
  },
  createIsolatedStudent: async ({ request }, use) => {
    const createdTokens = [];
    const fn = async (name = 'E2E Learner') => {
      const email = `e2e.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@tarbiyah.test`;
      const password = 'Password123!';
      const res = await request.post('http://localhost:3001/api/v1/auth/register', {
        data: { name, email, password }
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      createdTokens.push(body.accessToken);
      return { email, password, ...body };
    };
    await use(fn);
    for (const token of createdTokens) {
      await request.delete('http://localhost:3001/api/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  }
});

export { expect };
