import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { mediaUrl } from '@features/hotel/adapters'
import { mediaId, staffClient } from '../api/staffClient'
import { chosenFiles, formatBytes, prepareUploadFile, uploadMediaFile } from '../lib/prepareImage'
import MediaLibraryPicker from './MediaLibraryPicker'
import styles from './MediaField.module.css'

export default function MediaField({
  label,
  value,
  onChange,
  accept = 'image/*',
}) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)
  const preview = pending?.preview || (typeof value === 'object' && value ? mediaUrl(value) : '')

  useEffect(() => {
    return () => {
      if (pending?.preview) URL.revokeObjectURL(pending.preview)
    }
  }, [pending])

  async function pickFile(event) {
    const [file] = chosenFiles(event)
    if (!file) return
    if (pending?.preview) URL.revokeObjectURL(pending.preview)
    const immediate = {
      file,
      preview: URL.createObjectURL(file),
      resized: false,
      originalSize: file.size,
      finalSize: file.size,
    }
    setPending(immediate)
    try {
      const prepared = await prepareUploadFile(file)
      setPending((current) => {
        if (!current || current.preview !== immediate.preview) {
          URL.revokeObjectURL(prepared.preview)
          return current
        }
        if (prepared.preview !== immediate.preview) URL.revokeObjectURL(immediate.preview)
        return prepared
      })
    } catch {
      toast.error('Could not prepare this file.')
    }
  }

  async function confirmUpload() {
    if (!pending) return
    setBusy(true)
    try {
      const doc = await uploadMediaFile(staffClient, pending.file, { alt: pending.file.name })
      onChange(doc)
      URL.revokeObjectURL(pending.preview)
      setPending(null)
      toast.success(pending.resized ? 'Image resized and uploaded.' : 'Image uploaded.')
    } catch {
      toast.error('Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  function cancelPending() {
    if (pending?.preview) URL.revokeObjectURL(pending.preview)
    setPending(null)
  }

  return (
    <div className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.card}>
        {preview ? (
          <img src={preview} alt="" className={styles.preview} />
        ) : (
          <div className={styles.empty}>No image</div>
        )}

        {pending && (
          <div className={styles.pendingNote}>
            <p>This is what will be uploaded</p>
            <small>
              {pending.resized
                ? `${formatBytes(pending.originalSize)} → ${formatBytes(pending.finalSize)} (resized, was over 700KB)`
                : `${formatBytes(pending.finalSize)} — no resize needed`}
            </small>
            <div className={styles.actions}>
              <button type="button" className={styles.btn} onClick={confirmUpload} disabled={busy}>
                {busy ? 'Uploading…' : 'Upload this image'}
              </button>
              <button type="button" className={styles.link} onClick={cancelPending} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {!pending && (
          <>
            <div className={`${styles.actions} ${mediaId(value) ? '' : styles.actionsSingle}`}>
              <label className={styles.btn}>
                {preview ? 'Replace' : 'Upload'}
                <input type="file" accept={accept} hidden onChange={pickFile} />
              </label>
              {mediaId(value) && (
                <button type="button" className={styles.link} onClick={() => onChange('')}>
                  Remove
                </button>
              )}
            </div>
            <button type="button" className={styles.library} onClick={() => setLibraryOpen(true)}>
              From library
            </button>
          </>
        )}
      </div>

      <MediaLibraryPicker
        open={libraryOpen}
        imagesOnly={accept.includes('image')}
        onClose={() => setLibraryOpen(false)}
        onSelect={onChange}
      />
    </div>
  )
}
