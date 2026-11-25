export class AppError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      details: []
    }
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Data sudah terdaftar',
        details: []
      }
    });
  }

  if (err && err.code === 'ER_NET_PACKET_TOO_LARGE') {
    return res.status(413).json({
      error: {
        code: 'PACKET_TOO_LARGE',
        message: 'Ukuran paket data melebihi kapasitas database',
        details: []
      }
    });
  }

  if (err && err.code === 'ER_DATA_TOO_LONG') {
    return res.status(400).json({
      error: {
        code: 'DATA_TOO_LONG',
        message: 'Panjang data melebihi kapasitas kolom database',
        details: []
      }
    });
  }

  if (err && err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran file terlalu besar. Maksimal ukuran file adalah 10 MB.'
        : 'Format unggahan file tidak valid.';
    return res.status(400).json({
      error: {
        code: 'UPLOAD_ERROR',
        message,
        details: []
      }
    });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Format data JSON tidak valid',
        details: []
      }
    });
  }

  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Ukuran permintaan melebihi batas maksimal server',
        details: []
      }
    });
  }

  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  const message =
    status >= 500
      ? 'Terjadi kesalahan pada server'
      : err.expose
        ? err.message
        : 'Permintaan tidak dapat diproses';
  if (status >= 500) {
    console.error('[ServerError]', err?.message || err);
  }

  return res.status(status).json({
    error: {
      code: status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message,
      details: []
    }
  });
}
