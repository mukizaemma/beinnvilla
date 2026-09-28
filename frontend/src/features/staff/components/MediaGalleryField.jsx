import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { mediaUrl } from '@features/hotel/adapters'
import { mediaId, staffClient } from '../api/staffClient'
import { formatBytes, prepareUploadFiles, uploadMediaFile } from '../lib/prepareImage'
import MediaLibraryPicker from './MediaLibraryPicker'
import styles from './MediaField.module.css'

export default function MediaGalleryField({
  label = 'Photos',
  hint = 'Choose several photos at once. Files over 700KB are resized before upload.',
  values = [],
  onChange,
  max = 12,
}) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [queue, setQueue] = useState([])
  const [busy, setBusy] = useState(false)
  const items = (values || []).filter(Boolean)

  useEffect(() => {
    return () => queue.forEach((item) => URL.revokeObjectURL(item.preview))
  }, [queue])

  async function pickFiles(event) {
    const files = event.target.files
    event.target.value = ''
    if (!files?.length) return
    const room = Math.max(0, max - items.length)
    if (!room) {
      toast.error(`This set already has ${max} photos.`)
      return
    }
    try {
      const prepared = await prepareUploadFiles(Array.from(files).slice(0, room))
      setQueue((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.preview))
        return prepared
      })
    } catch {
      toast.error('Could not prepare these images.')
    }
  }

  async function uploadQueue() {
    if (!queue.length) return
    setBusy(true)
    try {
      const uploaded = []
      for (const item of queue) {
        uploaded.push(await uploadMediaFile(staffClient, item.file, { alt: item.file.name }))
      }
      onChange([...items, ...uploaded].slice(0, max))
      queue.forEach((item) => URL.revokeObjectURL(item.preview))
      setQueue([])
      toast.success(
        uploaded.some((unused, index) => queue[index]?.resized)
          ? `${uploaded.length} image${uploaded.length === 1 ? '' : 's'} resized and uploaded.`
          : `${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded.`,
      )
    } catch {
      toast.error('Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  function removeAt(index) {
    onChange(items.filter((_, i) => i !== index))
  }

  function addFromLibrary(files) {
    const incoming = (Array.isArray(files) ? files : [files]).filter(Boolean)
    const known = new Set(items.map((item) => mediaId(item)))
    const next = incoming.filter((file) => !known.has(mediaId(file)))
    onChange([...items, ...next].slice(0, max))
  }

  return (
    <div className={`${styles.field} ${styles.galleryField}`}>
      {label && <span className={styles.label}>{label}</span>}
      {hint ? <p className={styles.hint}>{hint}</p> : null}

      <div className={styles.grid}>
        {items.map((item, index) => (
          <article key={mediaId(item) || index} className={styles.queueItem}>
            <img src={mediaUrl(item)} alt="" />
            <div>
              <small>{index === 0 ? 'Main photo' : `Photo ${index + 1}`}</small>
              <button type="button" className={styles.link} onClick={() => removeAt(index)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      {queue.length > 0 && (
        <div className={styles.pendingBlock}>
          <strong>Ready to upload ({queue.length})</strong>
          <div className={styles.grid}>
            {queue.map((item, index) => (
              <article key={`${item.file.name}-${index}`} className={styles.queueItem}>
                <img src={item.preview} alt={item.file.name} />
                <div>
                  <p>{item.file.name}</p>
                  <small>
                    {item.resized
                      ? `${formatBytes(item.originalSize)} → ${formatBytes(item.finalSize)} resized`
                      : `${formatBytes(item.finalSize)} — kept as-is`}
                  </small>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={uploadQueue} disabled={busy}>
              {busy ? 'Uploading…' : `Upload ${queue.length} image${queue.length === 1 ? '' : 's'}`}
            </button>
            <button
              type="button"
              className={styles.link}
              disabled={busy}
              onClick={() => {
                queue.forEach((item) => URL.revokeObjectURL(item.preview))
                setQueue([])
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length < max && queue.length === 0 && (
        <div className={styles.galleryActions}>
          <label className={styles.btn}>
            Add images
            <input type="file" accept="image/*" multiple hidden onChange={pickFiles} />
          </label>
          <button type="button" className={styles.library} onClick={() => setLibraryOpen(true)}>
            From library
          </button>
        </div>
      )}

      <MediaLibraryPicker
        open={libraryOpen}
        multiple
        title="Add existing images"
        onClose={() => setLibraryOpen(false)}
        onSelectMany={addFromLibrary}
      />
    </div>
  )
}
