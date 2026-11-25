import { pool, withTransaction } from '../config/db.js';

const VALID_SLIDESHOW_POSITIONS = new Set(['top', 'middle', 'bottom', 'none']);

const NEWS_MONTH_MAP = {
  januari: 1,
  jan: 1,
  january: 1,
  februari: 2,
  feb: 2,
  february: 2,
  pebruari: 2,
  maret: 3,
  mar: 3,
  march: 3,
  april: 4,
  apr: 4,
  mei: 5,
  may: 5,
  juni: 6,
  jun: 6,
  june: 6,
  juli: 7,
  jul: 7,
  july: 7,
  agustus: 8,
  agt: 8,
  aug: 8,
  august: 8,
  september: 9,
  sep: 9,
  sept: 9,
  oktober: 10,
  okt: 10,
  oct: 10,
  october: 10,
  november: 11,
  nopember: 11,
  nov: 11,
  desember: 12,
  des: 12,
  dec: 12,
  december: 12
};

function toDateSortKey(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return 0;
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return 0;
  return year * 10000 + month * 100 + day;
}

export function parseNewsDateSortKey(rawDate) {
  if (!rawDate || typeof rawDate !== 'string') return 0;
  const cleaned = rawDate.trim().replace(/,/g, ' ').replace(/\s+/g, ' ');

  const isoMatch = cleaned.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    return toDateSortKey(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const dmySlashMatch = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmySlashMatch) {
    return toDateSortKey(Number(dmySlashMatch[3]), Number(dmySlashMatch[2]), Number(dmySlashMatch[1]));
  }

  const dmyTextMatch = cleaned.match(/(\d{1,2})[\s-]+([A-Za-z]+)[\s-]+(\d{4})/);
  if (dmyTextMatch) {
    const month = NEWS_MONTH_MAP[dmyTextMatch[2].toLowerCase()];
    if (month) {
      return toDateSortKey(Number(dmyTextMatch[3]), month, Number(dmyTextMatch[1]));
    }
  }

  const mdyTextMatch = cleaned.match(/([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})/);
  if (mdyTextMatch) {
    const month = NEWS_MONTH_MAP[mdyTextMatch[1].toLowerCase()];
    if (month) {
      return toDateSortKey(Number(mdyTextMatch[3]), month, Number(mdyTextMatch[2]));
    }
  }

  return 0;
}

export function sortItemsByNewestDate(rows, dateField = 'job_title') {
  return [...rows].sort((a, b) => {
    const dateDiff = parseNewsDateSortKey(b[dateField]) - parseNewsDateSortKey(a[dateField]);
    if (dateDiff !== 0) return dateDiff;

    const createdDiff = (new Date(b.created_at || 0).getTime() || 0) - (new Date(a.created_at || 0).getTime() || 0);
    if (createdDiff !== 0) return createdDiff;

    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });
}

export function sortNewsByNewestDate(rows) {
  return sortItemsByNewestDate(rows, 'job_title');
}

function normalizeSlideshowPosition(pos) {
  return VALID_SLIDESHOW_POSITIONS.has(pos) ? pos : 'bottom';
}

function buildNewsExcerpt(fullContent, maxLength = 200) {
  const normalized = String(fullContent || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  const sliced = normalized.slice(0, maxLength - 3).replace(/\s+\S*$/, '');
  return `${sliced || normalized.slice(0, maxLength - 3)}...`;
}

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
      slideshow_position: normalizeSlideshowPosition(row.slideshow_position),
      categories,
      category_ids: categoryIds,
      category_names: categoryNames,
      category_name: row.category_name || categoryNames[0] || null
    };
  });
}

function hydrateAgendaRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  return rows.map((row) => ({
    ...row,
    event_time: row.event_time ?? null,
    cover_url: row.cover_url ?? null
  }));
}

export async function getLandingData() {
  const [
    [statsRows],
    [featuresRows],
    [partnersRows],
    [testimonialsRows],
    [agendasRows],
    [faqsRows],
    [settingsRows]
  ] = await Promise.all([
    pool.execute('SELECT id, stat_group, label, value_num, suffix, sort_order FROM stats ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT id, title, description, icon, sort_order FROM features ORDER BY sort_order ASC, id ASC'),
    pool.execute('SELECT id, name, logo_url, url, sort_order FROM partners ORDER BY sort_order ASC, id ASC'),
    pool.execute(`
      SELECT t.id, t.name, t.job_title, t.quote, t.full_content, t.rating, t.avatar_url,
             t.gallery_urls, t.slideshow_position, t.sort_order,
             t.category_id, nc.name AS category_name, t.created_at, t.updated_at
      FROM testimonials t
      LEFT JOIN news_categories nc ON nc.id = t.category_id
      WHERE t.is_visible = 1
      ORDER BY t.sort_order ASC, t.id ASC
    `),
    pool.execute(`
      SELECT id, title, event_date, event_time, excerpt, description,
             cover_url, sort_order, created_at, updated_at
      FROM agendas
      WHERE is_visible = 1
      ORDER BY sort_order ASC, id ASC
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
    testimonials: sortNewsByNewestDate(await hydrateNewsRows(testimonialsRows)),
    agendas: sortItemsByNewestDate(hydrateAgendaRows(agendasRows), 'event_date'),
    faqs: faqsRows
  };
}

export async function getPublishedNewsById(id) {
  const [rows] = await pool.execute(
    `SELECT t.id, t.name, t.job_title, t.quote, t.full_content, t.rating, t.avatar_url,
            t.gallery_urls, t.slideshow_position, t.sort_order,
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
      (SELECT COUNT(*) FROM agendas) AS totalAgendas,
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

export async function listTestimonialsAdmin({ limit = null, offset = 0 } = {}) {
  const pageClause = limit ? ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}` : '';
  const [rows] = await pool.execute(`
    SELECT t.*, nc.name AS category_name
    FROM testimonials t
    LEFT JOIN news_categories nc ON nc.id = t.category_id
    ORDER BY t.sort_order ASC, t.id ASC${pageClause}
  `);
  return sortNewsByNewestDate(await hydrateNewsRows(rows));
}

export async function createTestimonial({
  name,
  jobTitle,
  quote = null,
  fullContent = null,
  rating,
  avatarUrl = null,
  galleryUrls = [],
  slideshowPosition = 'bottom',
  categoryId,
  categoryIds,
  isVisible,
  sortOrder
}) {
  const normalizedCategoryIds = normalizeCategoryIds({ categoryId, categoryIds });
  const primaryCategoryId = normalizedCategoryIds[0] || null;
  const serializedGallery = serializeGalleryUrls(galleryUrls);
  const cleanFullContent = fullContent?.trim() ? fullContent.trim() : null;
  const cleanQuote = quote?.trim() ? quote.trim() : buildNewsExcerpt(cleanFullContent);
  const cleanPosition = normalizeSlideshowPosition(slideshowPosition);

  const conn = await pool.getConnection();
  let insertedId = null;
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute(
      `INSERT INTO testimonials
        (name, job_title, quote, full_content, rating, avatar_url, gallery_urls, slideshow_position, category_id, is_visible, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        jobTitle,
        cleanQuote,
        cleanFullContent,
        rating,
        avatarUrl,
        serializedGallery,
        cleanPosition,
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
    quote = null,
    fullContent = null,
    rating,
    avatarUrl = null,
    galleryUrls = [],
    slideshowPosition = 'bottom',
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
  const cleanQuote = quote?.trim() ? quote.trim() : buildNewsExcerpt(cleanFullContent);
  const cleanPosition = normalizeSlideshowPosition(slideshowPosition);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [updateRes] = await conn.execute(
      `UPDATE testimonials
       SET name = ?, job_title = ?, quote = ?, full_content = ?, rating = ?, avatar_url = ?,
           gallery_urls = ?, slideshow_position = ?, category_id = ?, is_visible = ?, sort_order = ?
       WHERE id = ?`,
      [
        name,
        jobTitle,
        cleanQuote,
        cleanFullContent,
        rating,
        avatarUrl,
        serializedGallery,
        cleanPosition,
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

export async function listAgendasAdmin({ limit = null, offset = 0 } = {}) {
  const pageClause = limit ? ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}` : '';
  const [rows] = await pool.execute(`SELECT * FROM agendas ORDER BY sort_order ASC, id ASC${pageClause}`);
  return sortItemsByNewestDate(hydrateAgendaRows(rows), 'event_date');
}

export async function createAgenda({
  title,
  eventDate,
  eventTime = null,
  description,
  coverUrl = null,
  isVisible = true,
  sortOrder = 0
}) {
  const cleanDescription = description.trim();
  const excerpt = buildNewsExcerpt(cleanDescription);
  const cleanTime = eventTime?.trim() ? eventTime.trim() : null;
  const cleanCover = coverUrl?.trim() ? coverUrl.trim() : null;

  const [result] = await pool.execute(
    `INSERT INTO agendas
      (title, event_date, event_time, excerpt, description, cover_url, is_visible, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, eventDate, cleanTime, excerpt, cleanDescription, cleanCover, isVisible ? 1 : 0, sortOrder]
  );
  const [rows] = await pool.execute('SELECT * FROM agendas WHERE id = ? LIMIT 1', [result.insertId]);
  return hydrateAgendaRows(rows)[0] || null;
}

export async function updateAgenda(
  id,
  {
    title,
    eventDate,
    eventTime = null,
    description,
    coverUrl = null,
    isVisible = true,
    sortOrder = 0
  }
) {
  const cleanDescription = description.trim();
  const excerpt = buildNewsExcerpt(cleanDescription);
  const cleanTime = eventTime?.trim() ? eventTime.trim() : null;
  const cleanCover = coverUrl?.trim() ? coverUrl.trim() : null;

  const [res] = await pool.execute(
    `UPDATE agendas
     SET title = ?, event_date = ?, event_time = ?, excerpt = ?, description = ?,
         cover_url = ?, is_visible = ?, sort_order = ?
     WHERE id = ?`,
    [title, eventDate, cleanTime, excerpt, cleanDescription, cleanCover, isVisible ? 1 : 0, sortOrder, id]
  );
  if (res.affectedRows === 0) return null;
  const [rows] = await pool.execute('SELECT * FROM agendas WHERE id = ? LIMIT 1', [id]);
  return hydrateAgendaRows(rows)[0] || null;
}

export async function deleteAgenda(id) {
  const [result] = await pool.execute('DELETE FROM agendas WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function listFaqsAdmin({ limit = null, offset = 0 } = {}) {
  const pageClause = limit ? ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}` : '';
  const [rows] = await pool.execute(`SELECT * FROM faqs ORDER BY sort_order ASC, id ASC${pageClause}`);
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

export async function listStatsAdmin({ limit = null, offset = 0 } = {}) {
  const pageClause = limit ? ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}` : '';
  const [rows] = await pool.execute(
    `SELECT * FROM stats ORDER BY stat_group ASC, sort_order ASC, id ASC${pageClause}`
  );
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

export async function listFeaturesAdmin({ limit = null, offset = 0 } = {}) {
  const pageClause = limit ? ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}` : '';
  const [rows] = await pool.execute(`SELECT * FROM features ORDER BY sort_order ASC, id ASC${pageClause}`);
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

export async function listPartnersAdmin({ limit = null, offset = 0 } = {}) {
  const pageClause = limit ? ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}` : '';
  const [rows] = await pool.execute(`SELECT * FROM partners ORDER BY sort_order ASC, id ASC${pageClause}`);
  return rows;
}

export async function createPartner({ name, logoUrl = null, url = null, sortOrder = 0 }) {
  const [result] = await pool.execute(
    'INSERT INTO partners (name, logo_url, url, sort_order) VALUES (?, ?, ?, ?)',
    [name, logoUrl || null, url || null, Number(sortOrder) || 0]
  );
  const [rows] = await pool.execute('SELECT * FROM partners WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updatePartner(id, { name, logoUrl, url = null, sortOrder = 0 }) {
  if (logoUrl === undefined) {
    await pool.execute(
      'UPDATE partners SET name = ?, url = ?, sort_order = ? WHERE id = ?',
      [name, url || null, Number(sortOrder) || 0, id]
    );
  } else {
    await pool.execute(
      'UPDATE partners SET name = ?, logo_url = ?, url = ?, sort_order = ? WHERE id = ?',
      [name, logoUrl || null, url || null, Number(sortOrder) || 0, id]
    );
  }
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
  await withTransaction(async (conn) => {
    for (const [key, val] of entries) {
      await conn.execute(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, String(val)]
      );
    }
  });
  return getSettingsMap();
}
