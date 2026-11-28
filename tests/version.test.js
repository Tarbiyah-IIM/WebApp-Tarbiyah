import { describe, expect, it } from 'vitest';
import { computeSemverFromCommits, parseSemverTuple, resolveAppVersion } from '../scripts/resolveAppVersion.mjs';

describe('Automatic Conventional SemVer Resolver', () => {
  it('parses base SemVer strings cleanly and falls back safely on invalid input', () => {
    expect(parseSemverTuple('1.2.3')).toEqual([1, 2, 3]);
    expect(parseSemverTuple('v2.4.10')).toEqual([2, 4, 10]);
    expect(parseSemverTuple('invalid')).toEqual([1, 0, 0]);
  });

  it('bumps patch, minor, and major accurately from Conventional Commit records', () => {
    expect(
      computeSemverFromCommits([1, 0, 0], [
        'fix(nav): keep single line label',
        'perf(cache): tune TTL',
        'docs: update readme'
      ])
    ).toBe('1.0.2');

    expect(
      computeSemverFromCommits([1, 0, 4], [
        'feat(agenda): expand desktop grid to 4 cards'
      ])
    ).toBe('1.1.0');

    expect(
      computeSemverFromCommits([1, 4, 2], [
        'feat(portal)!: redesign root API contract\n\nBREAKING CHANGE: v2 endpoint routes'
      ])
    ).toBe('2.0.0');
  });

  it('falls back safely when rootDir has no git repository', () => {
    expect(resolveAppVersion({ rootDir: 'C:/non-existent-tarbiyah-dir', baseVersion: '1.3.5' })).toBe('1.3.5');
  });
});
