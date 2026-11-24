const DEFAULT_MAX_DIMENSION = 1600;
const FALLBACK_MAX_DIMENSION = 1280;
const COMPACT_MAX_DIMENSION = 960;
const DEFAULT_TARGET_BYTES = 350 * 1024;
const SKIP_OPTIMIZE_BYTES = 150 * 1024;
const HARD_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const QUALITY_STEPS = [0.82, 0.72, 0.62];

const OPTIMIZABLE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const MIME_TO_EXT = {
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/png': '.png'
};

function replaceFileExtension(originalName, mimeType) {
  const ext = MIME_TO_EXT[mimeType] || '.webp';
  const baseName = String(originalName || 'image')
    .trim()
    .replace(/\.[^.]+$/, '') || 'image';
  return `${baseName}${ext}`;
}

function computeTargetDimensions(width, height, maxDimension) {
  const longestSide = Math.max(width, height);
  if (longestSide <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / longestSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => URL.revokeObjectURL(objectUrl)
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('IMAGE_DECODE_FAILED'));
    };
    img.src = objectUrl;
  });
}

async function decodeImageSource(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => {
          if (typeof bitmap.close === 'function') {
            bitmap.close();
          }
        }
      };
    } catch {
      return loadImageElement(file);
    }
  }
  return loadImageElement(file);
}

function encodeCanvasBlob(source, width, height, mimeType, quality) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.width = 0;
      canvas.height = 0;
      resolve(null);
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(source, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        canvas.width = 0;
        canvas.height = 0;
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

async function tryAdaptiveEncode(source, width, height, targetBytes) {
  let bestBlob = null;
  let activeMime = 'image/webp';

  for (let i = 0; i < QUALITY_STEPS.length; i += 1) {
    const quality = QUALITY_STEPS[i];
    let blob = await encodeCanvasBlob(source, width, height, activeMime, quality);
    if (i === 0 && (!blob || blob.type !== 'image/webp')) {
      activeMime = 'image/jpeg';
      blob = await encodeCanvasBlob(source, width, height, activeMime, quality);
    }
    if (!blob) break;
    if (!bestBlob || blob.size < bestBlob.size) {
      bestBlob = blob;
    }
    if (blob.size <= targetBytes) {
      return bestBlob;
    }
  }

  return bestBlob;
}

export async function optimizeImageForUpload(file, options = {}) {
  if (!file || typeof file !== 'object' || typeof document === 'undefined') {
    return file;
  }

  const mime = String(file.type || '').toLowerCase();
  if (!OPTIMIZABLE_MIMES.has(mime)) {
    return file;
  }

  const maxDimension = Number(options.maxDimension) || DEFAULT_MAX_DIMENSION;
  const targetBytes = Number(options.targetBytes) || DEFAULT_TARGET_BYTES;
  const skipBytes = Number(options.skipBytes) || SKIP_OPTIMIZE_BYTES;

  let decoded = null;
  try {
    decoded = await decodeImageSource(file);
    if (!decoded || decoded.width <= 0 || decoded.height <= 0) {
      return file;
    }

    const longestSide = Math.max(decoded.width, decoded.height);
    if (file.size <= skipBytes && longestSide <= maxDimension) {
      return file;
    }

    const primaryDims = computeTargetDimensions(decoded.width, decoded.height, maxDimension);
    let bestBlob = await tryAdaptiveEncode(decoded.source, primaryDims.width, primaryDims.height, targetBytes);

    if (
      bestBlob &&
      bestBlob.size > targetBytes &&
      (Math.max(primaryDims.width, primaryDims.height) > FALLBACK_MAX_DIMENSION || bestBlob.size > 1024 * 1024)
    ) {
      const fallbackDims = computeTargetDimensions(decoded.width, decoded.height, FALLBACK_MAX_DIMENSION);
      const fallbackBlob = await encodeCanvasBlob(
        decoded.source,
        fallbackDims.width,
        fallbackDims.height,
        bestBlob.type || 'image/webp',
        0.72
      );
      if (fallbackBlob && fallbackBlob.size < bestBlob.size) {
        bestBlob = fallbackBlob;
      }
      if (bestBlob.size > targetBytes * 2) {
        const tighterBlob = await encodeCanvasBlob(
          decoded.source,
          fallbackDims.width,
          fallbackDims.height,
          bestBlob.type || 'image/webp',
          0.62
        );
        if (tighterBlob && tighterBlob.size < bestBlob.size) {
          bestBlob = tighterBlob;
        }
      }
    }

    if (bestBlob && bestBlob.size > HARD_MAX_UPLOAD_BYTES) {
      const compactDims = computeTargetDimensions(decoded.width, decoded.height, COMPACT_MAX_DIMENSION);
      const compactBlob = await encodeCanvasBlob(
        decoded.source,
        compactDims.width,
        compactDims.height,
        bestBlob.type || 'image/webp',
        0.6
      );
      if (compactBlob && compactBlob.size < bestBlob.size) {
        bestBlob = compactBlob;
      }
    }

    if (!bestBlob) {
      return file;
    }

    if (bestBlob.size >= file.size && file.size <= HARD_MAX_UPLOAD_BYTES && longestSide <= maxDimension) {
      return file;
    }

    const outputMime = bestBlob.type || 'image/webp';
    const nextName = replaceFileExtension(file.name, outputMime);
    return new File([bestBlob], nextName, {
      type: outputMime,
      lastModified: Date.now()
    });
  } catch {
    return file;
  } finally {
    if (decoded && typeof decoded.cleanup === 'function') {
      decoded.cleanup();
    }
  }
}
