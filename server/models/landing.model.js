import { pool } from '../config/db.js';

function parseGalleryUrls(raw) {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function serializeGalleryUrls(list) {
  const cleaned = Array.from(
    new Set((Array.isArray(list) ? list : []).map((item) => String(item || '').trim()).filter(Boolean))
  );
  return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
}

function normalizeCategoryIds({ categoryId, categoryIds }) {
  const source = Array.isArray(categoryIds) && categoryIds.length > 0 ? categoryIds : [categoryId];
  const unique = [];
  for (const raw of source) {
    const num = Number(raw);
    if (Number.isInteger(num) && num > 0 && !unique.includes(num)) {
      unique.push(num);
    }
  }
  return unique;
}

async function hydrateNewsRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const ids = rows.map((r) => Number(r.id)).filter((id) => Number.isInteger(id) && id > 0);
  const categoryMap = new Map();

  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    const [pivotRows] = await pool.execute(
      `SELECT tc.testimonial_id, nc.id, nc.name
       FROM testimonial_categories tc
       INNER JOIN news_categories nc ON nc.id = tc.category_id
       WHERE tc.testimonial_id IN (${placeholders})
       ORDER BY nc.name ASC, nc.id ASC`,
      ids
    );
    for (const pivot of pivotRows) {
      const list = categoryMap.get(pivot.testimonial_id) || [];
      list.push({ id: pivot.id, name: pivot.name });
      categoryMap.set(pivot.testimonial_id, list);
    }
  }

  return rows.map((row) => {
    const categories = categoryMap.get(row.id) || [];
    if (categories.length === 0 && row.category_id && row.category_name) {
      categories.push({ id: row.category_id, name: row.category_name });
    }
    const categoryIds = categories.map((cat) => cat.id);
    const categoryNames = categories.map((cat) => cat.name);
    return {
      ...row,
      full_content: row.full_content ?? null,
      gallery_urls: parseGalleryUrls(row.gallery_urls),
      slideshow_position: ['top', 'bottom', 'none'].includes(row.slideshow_position)
        ? row.slideshow_position
        : 'bottom',
      related_url: row.related_url ?? null,
      categories,
      category_ids: categoryIds,
      category_names: categoryNames,
      category_name: row.category_name || categoryNames[0] || null
    };
  });
}

export async function getLandingData() {
  const [
    [statsRows],
    [featuresRows],
    [partnersRows],
    [testimonialsRows],
    [faqsRows],
    [settingsRows]
  ] = await Promise.all([
    pool.execute('SELECT id, stat_group, label, value_num, suffix, sort_order FROM stats ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT id, title, description, icon, sort_order FROM features ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT id, name, logo_url, url, sort_order FROM partners ORDER BY sort_order ASC, id ASC'),
    pool.execute(`
      SELECT t.id, t.name, t.job_title, t.quote, t.full_content, t.rating, t.avatar_url,
             t.gallery_urls, t.slideshow_position, t.related_url, t.sort_order,
             t.category_id, nc.name AS category_name, t.created_at, t.updated_at
      FROM testimonials t
      LEFT JOIN news_categories nc ON nc.id = t.category_id
      WHERE t.is_visible = 1
      ORDER BY t.sort_order ASC, t.id ASC
    `),
    pool.execute('SELECT id, question, answer, sort_order FROM faqs ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT setting_key, setting_value FROM site_settings')
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
    partners: partnersRows,
    testimonials: await hydrateNewsRows(testimonialsRows),
    faqs: faqsRows
  };
}

export async function getPublishedNewsById(id) {
  const [rows] = await pool.execute(
    `SELECT t.id, t.name, t.job_title, t.quote, t.full_content, t.rating, t.avatar_url,
            t.gallery_urls, t.slideshow_position, t.related_url, t.sort_order,
            t.category_id, nc.name AS category_name, t.created_at, t.updated_at
     FROM testimonials t
     LEFT JOIN news_categories nc ON nc.id = t.category_id
     WHERE t.id = ? AND t.is_visible = 1
     LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  const hydrated = await hydrateNewsRows(rows);
  return hydrated[0] || null;
}

export async function getPortalOverviewStats() {
  const [[counts]] = await pool.execute(
    `SELECT
      (SELECT COUNT(*) FROM users) AS totalUsers,
      (SELECT COUNT(*) FROM testimonials) AS totalNews,
      (SELECT COUNT(*) FROM faqs) AS totalFaqs,
      (SELECT COUNT(*) FROM partners) AS totalServices,
      (SELECT COUNT(*) FROM features) AS totalFeatures`
  );
  return counts;
}

export async function createSubscriber({ email, source = 'footer' }) {
  const [existing] = await pool.execute('SELECT id, email FROM subscribers WHERE email = ? LIMIT 1', [email]);
  if (existing.length > 0) {
    return { ...existing[0], alreadySubscribed: true };
  }
  const [result] = await pool.execute('INSERT INTO subscribers (email, source) VALUES (?, ?)', [email, source]);
  return { id: result.insertId, email, alreadySubscribed: false };
}

async function findNewsByIdAdmin(id) {
  const [rows] = await pool.execute(
    `SELECT t.*, nc.name AS category_name
     FROM testimonials t
     LEFT JOIN news_categories nc ON nc.id = t.category_id
     WHERE t.id = ?
     LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  const hydrated = await hydrateNewsRows(rows);
  return hydrated[0] || null;
}

export async function listTestimonialsAdmin() {
  const [rows] = await pool.execute(`
    SELECT t.*, nc.name AS category_name
    FROM testimonials t
    LEFT JOIN news_categories nc ON nc.id = t.category_id
    ORDER BY t.sort_order ASC, t.id ASC
  `);
  return hydrateNewsRows(rows);
}

export async function createTestimonial({
  name,
  jobTitle,
  quote,
  fullContent = null,
  rating,
  avatarUrl = null,
  galleryUrls = [],
  slideshowPosition = 'bottom',
  relatedUrl = null,
  categoryId,
  categoryIds,
  isVisible,
  sortOrder
}) {
  const normalizedCategoryIds = normalizeCategoryIds({ categoryId, categoryIds });
  const primaryCategoryId = normalizedCategoryIds[0] || null;
  const serializedGallery = serializeGalleryUrls(galleryUrls);
  const cleanFullContent = fullContent?.trim() ? fullContent.trim() : null;
  const cleanRelatedUrl = relatedUrl?.trim() ? relatedUrl.trim() : null;
  const cleanPosition = ['top', 'bottom', 'none'].includes(slideshowPosition) ? slideshowPosition : 'bottom';

  const conn = await pool.getConnection();
  let insertedId = null;
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute(
      `INSERT INTO testimonials
        (name, job_title, quote, full_content, rating, avatar_url, gallery_urls, slideshow_position, related_url, category_id, is_visible, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        jobTitle,
        quote,
        cleanFullContent,
        rating,
        avatarUrl,
        serializedGallery,
        cleanPosition,
        cleanRelatedUrl,
        primaryCategoryId,
        isVisible ? 1 : 0,
        sortOrder
      ]
    );
    insertedId = result.insertId;
    for (const catId of normalizedCategoryIds) {
      await conn.execute(
        'INSERT INTO testimonial_categories (testimonial_id, category_id) VALUES (?, ?)',
        [insertedId, catId]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return findNewsByIdAdmin(insertedId);
}

export async function updateTestimonial(
  id,
  {
    name,
    jobTitle,
    quote,
    fullContent = null,
    rating,
    avatarUrl = null,
    galleryUrls = [],
    slideshowPosition = 'bottom',
    relatedUrl = null,
    categoryId,
    categoryIds,
    isVisible,
    sortOrder
  }
) {
  const normalizedCategoryIds = normalizeCategoryIds({ categoryId, categoryIds });
  const primaryCategoryId = normalizedCategoryIds[0] || null;
  const serializedGallery = serializeGalleryUrls(galleryUrls);
  const cleanFullContent = fullContent?.trim() ? fullContent.trim() : null;
  const cleanRelatedUrl = relatedUrl?.trim() ? relatedUrl.trim() : null;
  const cleanPosition = ['top', 'bottom', 'none'].includes(slideshowPosition) ? slideshowPosition : 'bottom';

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [updateRes] = await conn.execute(
      `UPDATE testimonials
       SET name = ?, job_title = ?, quote = ?, full_content = ?, rating = ?, avatar_url = ?,
           gallery_urls = ?, slideshow_position = ?, related_url = ?, category_id = ?, is_visible = ?, sort_order = ?
       WHERE id = ?`,
      [
        name,
        jobTitle,
        quote,
        cleanFullContent,
        rating,
        avatarUrl,
        serializedGallery,
        cleanPosition,
        cleanRelatedUrl,
        primaryCategoryId,
        isVisible ? 1 : 0,
        sortOrder,
        id
      ]
    );
    if (updateRes.affectedRows === 0) {
      await conn.rollback();
      return null;
    }
    await conn.execute('DELETE FROM testimonial_categories WHERE testimonial_id = ?', [id]);
    for (const catId of normalizedCategoryIds) {
      await conn.execute(
        'INSERT INTO testimonial_categories (testimonial_id, category_id) VALUES (?, ?)',
        [id, catId]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return findNewsByIdAdmin(id);
}

export async function deleteTestimonial(id) {
  const [result] = await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listNewsCategoriesAdmin() {
  const [rows] = await pool.execute('SELECT id, name FROM news_categories ORDER BY name ASC, id ASC');
  return rows;
}

export async function createNewsCategory({ name }) {
  const [result] = await pool.execute('INSERT INTO news_categories (name) VALUES (?)', [name]);
  const [rows] = await pool.execute('SELECT id, name FROM news_categories WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function deleteNewsCategory(id) {
  try {
    const [result] = await pool.execute('DELETE FROM news_categories WHERE id = ?', [id]);
    return { deleted: result.affectedRows > 0 };
  } catch (err) {
    if (err?.code === 'ER_ROW_IS_REFERENCED_2') {
      return { deleted: false, inUse: true };
    }
    throw err;
  }
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
