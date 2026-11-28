import { execFileSync } from 'node:child_process';

/**
 * Parse a MAJOR.MINOR.PATCH string into a numeric 3-tuple.
 */
export function parseSemverTuple(rawVersion) {
  const match = String(rawVersion || '').trim().match(/^v?(\d+)\.(\d+)\.(\d+)/i);
  if (!match) return [1, 0, 0];
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * Advance a base SemVer tuple using Conventional Commit records.
 */
export function computeSemverFromCommits(baseTuple, commitRecords) {
  let [major, minor, patch] = Array.isArray(baseTuple) && baseTuple.length === 3
    ? baseTuple.map((n) => (Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0))
    : [1, 0, 0];

  for (const record of commitRecords || []) {
    const trimmed = String(record || '').trim();
    if (!trimmed) continue;
    const newlineIdx = trimmed.indexOf('\n');
    const subject = newlineIdx === -1 ? trimmed : trimmed.slice(0, newlineIdx).trim();
    const body = newlineIdx === -1 ? '' : trimmed.slice(newlineIdx + 1);

    if (/^BREAKING CHANGE:/m.test(body) || /^[a-z]+(?:\([^)]+\))?!:/i.test(subject)) {
      major += 1;
      minor = 0;
      patch = 0;
      continue;
    }

    if (/^feat(?:\([^)]+\))?:/i.test(subject)) {
      minor += 1;
      patch = 0;
      continue;
    }

    if (/^(?:fix|perf|refactor)(?:\([^)]+\))?:/i.test(subject)) {
      patch += 1;
    }
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * Resolve the application build version from the nearest Git SemVer tag and subsequent app commits.
 */
export function resolveAppVersion({ rootDir, baseVersion = '1.0.0' }) {
  const fallback = parseSemverTuple(baseVersion).join('.');
  try {
    const latestTag = execFileSync(
      'git',
      ['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*.[0-9]*.[0-9]*'],
      { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    if (!latestTag) return fallback;

    const rawLog = execFileSync(
      'git',
      ['log', '--reverse', '--format=%s%n%b%x1e', `${latestTag}..HEAD`, '--', 'src', 'server', 'public'],
      { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    const records = rawLog.split('\x1e').map((entry) => entry.trim()).filter(Boolean);
    return computeSemverFromCommits(parseSemverTuple(latestTag), records);
  } catch {
    return fallback;
  }
}
