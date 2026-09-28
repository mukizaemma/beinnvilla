const LIMIT = 700 * 1024
const MAX_EDGE = 1920

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

async function drawScaled(source, width, height, type, quality) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(source, 0, 0, width, height)
  return canvasToBlob(canvas, type, quality)
}

async function compressImage(file) {
  const bitmap = await createImageBitmap(file)
  let width = bitmap.width
  let height = bitmap.height
  const edge = Math.max(width, height)
  if (edge > MAX_EDGE) {
    const scale = MAX_EDGE / edge
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  let quality = 0.86
  let blob = await drawScaled(bitmap, width, height, 'image/jpeg', quality)
  while (blob && blob.size > LIMIT && quality > 0.48) {
    quality -= 0.08
    blob = await drawScaled(bitmap, width, height, 'image/jpeg', quality)
  }
  while (blob && blob.size > LIMIT && width > 720) {
    width = Math.round(width * 0.85)
    height = Math.round(height * 0.85)
    blob = await drawScaled(bitmap, width, height, 'image/jpeg', quality)
  }

  bitmap.close?.()
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}

export async function prepareUploadFile(file) {
  const originalPreview = URL.createObjectURL(file)
  if (!file.type.startsWith('image/') || file.size <= LIMIT) {
    return {
      file,
      preview: originalPreview,
      resized: false,
      originalSize: file.size,
      finalSize: file.size,
    }
  }

  try {
    const next = await compressImage(file)
    URL.revokeObjectURL(originalPreview)
    return {
      file: next,
      preview: URL.createObjectURL(next),
      resized: true,
      originalSize: file.size,
      finalSize: next.size,
    }
  } catch {
    return {
      file,
      preview: originalPreview,
      resized: false,
      originalSize: file.size,
      finalSize: file.size,
    }
  }
}

export async function prepareUploadFiles(fileList) {
  return Promise.all(Array.from(fileList || []).map((file) => prepareUploadFile(file)))
}

export async function uploadPreparedFile(file) {
  const body = new FormData()
  body.append('file', file)
  body.append('_payload', JSON.stringify({ alt: file.name.replace(/\.[^.]+$/, '') }))
  const res = await fetch('/api/media?depth=0', {
    method: 'POST',
    credentials: 'include',
    body,
  })
  if (!res.ok) throw new Error('upload failed')
  const json = await res.json()
  return json.doc || json
}
