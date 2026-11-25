import { AppError } from './error.middleware.js';

export function validateBody(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }));
      return next(new AppError(400, 'VALIDATION_ERROR', 'Input tidak valid', details));
    }
    req.body = parsed.data;
    return next();
  };
}
