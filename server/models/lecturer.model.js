import { pool } from '../config/db.js';

const ORDER_BY_LEADERSHIP_THEN_SORT =
  "CASE WHEN leadership_role IS NOT NULL AND TRIM(leadership_role) <> '' THEN 0 ELSE 1 END ASC, sort_order ASC, id ASC";

function toNullable(value) {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseEducationHistory(rawValue) {
  if (!rawValue) return [];
  let parsed = rawValue;
  if (typeof rawValue === 'string') {
    try {
      parsed = JSON.parse(rawValue);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item) => item && typeof item === 'object' && String(item.degreeLevel || '').trim() && String(item.institution || '').trim())
    .map((item) => ({
      degreeLevel: String(item.degreeLevel || '').trim(),
      institution: String(item.institution || '').trim(),
      major: String(item.major || '').trim(),
      academicDegree: String(item.academicDegree || '').trim(),
      graduationYear: String(item.graduationYear || '').trim()
    }));
}

function serializeEducationHistory(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return JSON.stringify(items);
}

function normalizeLecturerRow(row) {
  if (!row) return null;
  return {
    ...row,
    education_history: parseEducationHistory(row.education_history)
  };
}

function toDbTuple(data) {
  return [
    data.programSlug,
    data.name.trim(),
    toNullable(data.photoUrl),
    toNullable(data.nidn),
    data.teachingStatus || 'active',
    toNullable(data.academicRank),
    toNullable(data.rankGrade),
    toNullable(data.leadershipRole),
    toNullable(data.email),
    toNullable(data.education),
    toNullable(data.biography),
    serializeEducationHistory(data.educationHistory),
    toNullable(data.scholarUrl),
    toNullable(data.orcidUrl),
    toNullable(data.scopusUrl),
    toNullable(data.sintaUrl),
    toNullable(data.wosUrl),
    data.isVisible === false ? 0 : 1,
    Number(data.sortOrder) || 0
  ];
}

export async function listVisibleLecturers(programSlug = null) {
  if (programSlug) {
    const [rows] = await pool.execute(
      `SELECT id, program_slug, name, photo_url, nidn, teaching_status,
              academic_rank, rank_grade, leadership_role, email, education,
              biography, education_history, scholar_url, orcid_url, scopus_url, sinta_url, wos_url,
              sort_order, created_at, updated_at
       FROM lecturers
       WHERE is_visible = 1 AND program_slug = ?
       ORDER BY ${ORDER_BY_LEADERSHIP_THEN_SORT}`,
      [programSlug]
    );
    return rows.map(normalizeLecturerRow);
  }
  const [rows] = await pool.execute(
    `SELECT id, program_slug, name, photo_url, nidn, teaching_status,
            academic_rank, rank_grade, leadership_role, email, education,
            biography, education_history, scholar_url, orcid_url, scopus_url, sinta_url, wos_url,
            sort_order, created_at, updated_at
     FROM lecturers
     WHERE is_visible = 1
     ORDER BY program_slug ASC, ${ORDER_BY_LEADERSHIP_THEN_SORT}`
  );
  return rows.map(normalizeLecturerRow);
}

export async function listLecturersAdmin({ limit = null, offset = 0 } = {}) {
  const pageClause = limit ? ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}` : '';
  const [rows] = await pool.execute(
    `SELECT * FROM lecturers ORDER BY program_slug ASC, ${ORDER_BY_LEADERSHIP_THEN_SORT}${pageClause}`
  );
  return rows.map(normalizeLecturerRow);
}

export async function createLecturer(data) {
  const [result] = await pool.execute(
    `INSERT INTO lecturers
      (program_slug, name, photo_url, nidn, teaching_status,
       academic_rank, rank_grade, leadership_role, email, education,
       biography, education_history, scholar_url, orcid_url, scopus_url, sinta_url, wos_url,
       is_visible, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    toDbTuple(data)
  );
  const [rows] = await pool.execute('SELECT * FROM lecturers WHERE id = ? LIMIT 1', [result.insertId]);
  return normalizeLecturerRow(rows[0]);
}

export async function updateLecturer(id, data) {
  const [result] = await pool.execute(
    `UPDATE lecturers
     SET program_slug = ?, name = ?, photo_url = ?, nidn = ?,
         teaching_status = ?, academic_rank = ?, rank_grade = ?, leadership_role = ?,
         email = ?, education = ?, biography = ?, education_history = ?,
         scholar_url = ?, orcid_url = ?, scopus_url = ?, sinta_url = ?, wos_url = ?,
         is_visible = ?, sort_order = ?
     WHERE id = ?`,
    [...toDbTuple(data), id]
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.execute('SELECT * FROM lecturers WHERE id = ? LIMIT 1', [id]);
  return normalizeLecturerRow(rows[0]);
}

export async function deleteLecturer(id) {
  const [result] = await pool.execute('DELETE FROM lecturers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
