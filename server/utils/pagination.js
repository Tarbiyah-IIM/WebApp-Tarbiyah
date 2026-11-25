const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

/**
 * Reads optional pagination from an Express query object.
 * Absent parameters keep the previous "return everything" behaviour so the
 * existing admin UI never loses rows; passing them enables paging.
 */
export function readPagination(query = {}) {
  const rawLimit = query.limit;
  const rawOffset = query.offset;
  if (rawLimit === undefined && rawOffset === undefined) return null;
  const limit = Math.min(Math.max(Number(rawLimit) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const offset = Math.max(Number(rawOffset) || 0, 0);
  return { limit, offset };
}

export function readPaginationWithTotal(query = {}) {
  return readPagination(query) ?? { limit: null, offset: 0 };
}
