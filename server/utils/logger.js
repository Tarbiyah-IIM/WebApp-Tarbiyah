import crypto from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const requestContext = new AsyncLocalStorage();

function currentLevel() {
  const raw = String(process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'warn' : 'info')).toLowerCase();
  return LEVELS[raw] ?? LEVELS.info;
}

function write(level, message, meta) {
  if (LEVELS[level] < currentLevel()) return;
  const requestId = requestContext.getStore()?.requestId;
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: String(message ?? ''),
    ...(requestId ? { requestId } : {}),
    ...(meta && typeof meta === 'object' ? meta : meta === undefined ? {} : { meta })
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
}

export const logger = {
  debug: (message, meta) => write('debug', message, meta),
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta)
};

/** Attaches a request id and makes it available to every logger call in the request. */
export function requestLoggingMiddleware(req, res, next) {
  const incoming = String(req.headers['x-request-id'] || '').trim();
  const requestId = /^[A-Za-z0-9._-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId);
  requestContext.run({ requestId }, () => {
    const startedAt = Date.now();
    res.on('finish', () => {
      logger.info('http_request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - startedAt
      });
    });
    next();
  });
}

export function getRequestId() {
  return requestContext.getStore()?.requestId;
}
