import { pool } from '../config/db.js';

export async function getLandingData() {
  const [
    [statsRows],
    [featuresRows],
    [mentorsRows],
    [partnersRows],
    [testimonialsRows],
    [faqsRows],
    [settingsRows],
    [categoriesRows]
  ] = await Promise.all([
    pool.execute('SELECT id, stat_group, label, value_num, suffix, sort_order FROM stats ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT id, title, description, icon, sort_order FROM features ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT id, user_id, name, title, bio, photo_url, sort_order FROM mentors WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT id, name, logo_url, url, sort_order FROM partners ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT id, name, job_title, quote, rating, avatar_url, sort_order FROM testimonials WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT id, question, answer, sort_order FROM faqs ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT setting_key, setting_value FROM site_settings'),
    pool.execute('SELECT id, name, slug, description, sort_order FROM categories ORDER BY sort_order ASC, id ASC')
  ]);

  const settings = {};
  for (const row of settingsRows) {
    settings[row.setting_key] = row.setting_value;
  }

  return {
    settings,
    stats: {
      hero: statsRows.filter((s) => s.stat_group === 'hero'),
      journey: statsRows.filter((s) => s.stat_group === 'journey')
    },
    features: featuresRows,
    mentors: mentorsRows,
    partners: partnersRows,
    testimonials: testimonialsRows,
    faqs: faqsRows,
    categories: categoriesRows
  };
}

export async function createSubscriber({ email, source = 'footer' }) {
  const [existing] = await pool.execute('SELECT id, email FROM subscribers WHERE email = ? LIMIT 1', [email]);
  if (existing.length > 0) {
    return { ...existing[0], alreadySubscribed: true };
  }
  const [result] = await pool.execute('INSERT INTO subscribers (email, source) VALUES (?, ?)', [email, source]);
  return { id: result.insertId, email, alreadySubscribed: false };
}

export async function listTestimonialsAdmin() {
  const [rows] = await pool.execute('SELECT * FROM testimonials ORDER BY sort_order ASC, id ASC');
  return rows;
}

export async function createTestimonial({ name, jobTitle, quote, rating, avatarUrl, isVisible, sortOrder }) {
  const [result] = await pool.execute(
    'INSERT INTO testimonials (name, job_title, quote, rating, avatar_url, is_visible, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, jobTitle, quote, rating, avatarUrl, isVisible ? 1 : 0, sortOrder]
  );
  const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateTestimonial(id, { name, jobTitle, quote, rating, avatarUrl, isVisible, sortOrder }) {
  await pool.execute(
    'UPDATE testimonials SET name = ?, job_title = ?, quote = ?, rating = ?, avatar_url = ?, is_visible = ?, sort_order = ? WHERE id = ?',
    [name, jobTitle, quote, rating, avatarUrl, isVisible ? 1 : 0, sortOrder, id]
  );
  const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function deleteTestimonial(id) {
  const [result] = await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listFaqsAdmin() {
  const [rows] = await pool.execute('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC');
  return rows;
}

export async function createFaq({ question, answer, sortOrder }) {
  const [result] = await pool.execute(
    'INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)',
    [question, answer, sortOrder]
  );
  const [rows] = await pool.execute('SELECT * FROM faqs WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateFaq(id, { question, answer, sortOrder }) {
  await pool.execute(
    'UPDATE faqs SET question = ?, answer = ?, sort_order = ? WHERE id = ?',
    [question, answer, sortOrder, id]
  );
  const [rows] = await pool.execute('SELECT * FROM faqs WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function deleteFaq(id) {
  const [result] = await pool.execute('DELETE FROM faqs WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listStatsAdmin() {
  const [rows] = await pool.execute('SELECT * FROM stats ORDER BY stat_group ASC, sort_order ASC, id ASC');
  return rows;
}

export async function createStat({ statGroup, label, valueNum, suffix, sortOrder }) {
  const [result] = await pool.execute(
    'INSERT INTO stats (stat_group, label, value_num, suffix, sort_order) VALUES (?, ?, ?, ?, ?)',
    [statGroup, label, valueNum, suffix, sortOrder]
  );
  const [rows] = await pool.execute('SELECT * FROM stats WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateStat(id, { statGroup, label, valueNum, suffix, sortOrder }) {
  await pool.execute(
    'UPDATE stats SET stat_group = ?, label = ?, value_num = ?, suffix = ?, sort_order = ? WHERE id = ?',
    [statGroup, label, valueNum, suffix, sortOrder, id]
  );
  const [rows] = await pool.execute('SELECT * FROM stats WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function deleteStat(id) {
  const [result] = await pool.execute('DELETE FROM stats WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listFeaturesAdmin() {
  const [rows] = await pool.execute('SELECT * FROM features ORDER BY sort_order ASC, id ASC');
  return rows;
}

export async function createFeature({ title, description, icon, sortOrder }) {
  const [result] = await pool.execute(
    'INSERT INTO features (title, description, icon, sort_order) VALUES (?, ?, ?, ?)',
    [title, description, icon, sortOrder]
  );
  const [rows] = await pool.execute('SELECT * FROM features WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateFeature(id, { title, description, icon, sortOrder }) {
  await pool.execute(
    'UPDATE features SET title = ?, description = ?, icon = ?, sort_order = ? WHERE id = ?',
    [title, description, icon, sortOrder, id]
  );
  const [rows] = await pool.execute('SELECT * FROM features WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function deleteFeature(id) {
  const [result] = await pool.execute('DELETE FROM features WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listPartnersAdmin() {
  const [rows] = await pool.execute('SELECT * FROM partners ORDER BY sort_order ASC, id ASC');
  return rows;
}

export async function createPartner({ name, logoUrl, url, sortOrder }) {
  const [result] = await pool.execute(
    'INSERT INTO partners (name, logo_url, url, sort_order) VALUES (?, ?, ?, ?)',
    [name, logoUrl, url, sortOrder]
  );
  const [rows] = await pool.execute('SELECT * FROM partners WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updatePartner(id, { name, logoUrl, url, sortOrder }) {
  await pool.execute(
    'UPDATE partners SET name = ?, logo_url = ?, url = ?, sort_order = ? WHERE id = ?',
    [name, logoUrl, url, sortOrder, id]
  );
  const [rows] = await pool.execute('SELECT * FROM partners WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function deletePartner(id) {
  const [result] = await pool.execute('DELETE FROM partners WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getSettingsMap() {
  const [rows] = await pool.execute('SELECT setting_key, setting_value FROM site_settings');
  const map = {};
  for (const row of rows) {
    map[row.setting_key] = row.setting_value;
  }
  return map;
}

export async function upsertSettings(settingsObj) {
  const entries = Object.entries(settingsObj);
  for (const [key, val] of entries) {
    await pool.execute(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [key, String(val)]
    );
  }
  return getSettingsMap();
}
