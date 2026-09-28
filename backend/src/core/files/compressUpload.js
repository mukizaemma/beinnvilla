import sharp from 'sharp'

const LIMIT = 700 * 1024

async function jpegUnderLimit(input) {
  const meta = await sharp(input, { failOn: 'none' }).metadata()
  let width = Math.min(meta.width || 1920, 1920)
  let quality = 82

  const render = () =>
    sharp(input, { failOn: 'none' })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()

  let output = await render()
  while (output.length > LIMIT && quality > 46) {
    quality -= 6
    output = await render()
  }
  while (output.length > LIMIT && width > 720) {
    width = Math.round(width * 0.85)
    output = await render()
  }
  return output
}

export async function compressOversizedImage(req) {
  const file = req?.file
  if (!file) return

  const mime = String(file.mimetype || file.mimeType || '')
  if (!mime.startsWith('image/') || mime === 'image/svg+xml' || mime === 'image/gif') return

  const source = Buffer.isBuffer(file.data) ? file.data : null
  const size = Number(file.size || source?.length || 0)
  if (!source || size <= LIMIT) return

  let output
  try {
    output = await jpegUnderLimit(source)
  } catch {
    return
  }
  if (!output?.length || output.length >= size) return

  file.data = output
  file.size = output.length
  file.mimetype = 'image/jpeg'
  if (file.mimeType) file.mimeType = 'image/jpeg'
  if (typeof file.name === 'string') {
    file.name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  }
}
