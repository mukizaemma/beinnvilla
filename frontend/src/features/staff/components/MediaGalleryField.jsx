import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { mediaUrl } from '@features/hotel/adapters'
import { mediaId, staffClient } from '../api/staffClient'
import { prepareUploadFiles, uploadMediaFile } from '../lib/prepareImage'
import MediaLibraryPicker from './MediaLibraryPicker'
import styles from './MediaField.module.css'

export default function MediaGalleryField({
  label = 'Photos',
  hint = 'Choose several photos at once. Files over 700KB are resized before upload.',
  values = [],
  onChange,
  onPendingChange,
  max = 12,
}) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [jobs, setJobs] = useState([])
  const items = (values || []).filter(Boolean)
  const itemsRef = useRef(items)
  const jobsRef = useRef(jobs)
  itemsRef.current = items
  jobsRef.current = jobs
  const uploading = jobs.filter((job) => job.status === 'uploading').length
  const failed = jobs.filter((job) => job.status === 'failed').length
  const pending = uploading > 0 || failed > 0

  useEffect(() => {
    onPendingChange?.(pending)
  }, [pending, onPendingChange])

  useEffect(() => {
    return () => jobsRef.current.forEach((job) => URL.revokeObjectURL(job.preview))
  }, [])

  async function uploadJob(job) {
    try {
      const doc = await uploadMediaFile(staffClient, job.file, { alt: job.file.name })
      if (!jobsRef.current.some((item) => item.id === job.id)) return
      const next = [...itemsRef.current, doc].slice(0, max)
      itemsRef.current = next
      onChange(next)
      URL.revokeObjectURL(job.preview)
      setJobs((current) => current.filter((item) => item.id !== job.id))
    } catch {
      setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, status: 'failed' } : item)))
    }
  }

  function retryJob(job) {
    setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, status: 'uploading' } : item)))
    uploadJob({ ...job, status: 'uploading' })
  }

  async function pickFiles(event) {
    const files = event.target.files
    event.target.value = ''
    if (!files?.length) return
    const room = Math.max(0, max - items.length - jobs.length)
    if (!room) {
      toast.error(`This set already has ${max} photos.`)
      return
    }
    try {
      const prepared = await prepareUploadFiles(Array.from(files).slice(0, room))
      const nextJobs = prepared.map((item) => ({ ...item, id: crypto.randomUUID(), status: 'uploading' }))
      setJobs((current) => [...current, ...nextJobs])
      nextJobs.forEach((job) => uploadJob(job))
    } catch {
      toast.error('Could not prepare these images.')
    }
  }

  function removeJob(job) {
    URL.revokeObjectURL(job.preview)
    setJobs((current) => current.filter((item) => item.id !== job.id))
  }

  function removeAt(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index))
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

      <p className={uploading || failed ? styles.statusWait : styles.statusDone} role="status">
        {uploading
          ? `Uploading ${uploading} photo${uploading === 1 ? '' : 's'}. Wait before saving — they are not stored yet.`
          : failed
            ? `${failed} photo${failed === 1 ? '' : 's'} did not upload and will not be saved. Remove or try again.`
            : items.length
              ? `${items.length} photo${items.length === 1 ? '' : 's'} uploaded. You can continue.`
              : 'No gallery photos yet.'}
      </p>

      <div className={styles.grid}>
        {items.map((item, index) => (
          <article key={mediaId(item) || index} className={styles.photoTile}>
            <img src={mediaUrl(item)} alt="" />
            <button type="button" className={styles.removeIcon} onClick={() => removeAt(index)} aria-label="Remove photo">
              <X size={14} />
            </button>
            <small>Uploaded</small>
          </article>
        ))}
        {jobs.map((job) => (
          <article key={job.id} className={styles.photoTile}>
            <img src={job.preview} alt={job.file.name} />
            <button type="button" className={styles.removeIcon} onClick={() => removeJob(job)} aria-label="Remove photo">
              <X size={14} />
            </button>
            <small className={job.status === 'failed' ? styles.tileFailed : undefined}>
              {job.status === 'uploading' ? 'Uploading…' : 'Not uploaded'}
            </small>
            {job.status === 'failed' ? (
              <button type="button" className={styles.retry} onClick={() => retryJob(job)}>
                Try again
              </button>
            ) : null}
          </article>
        ))}
      </div>

      {items.length + jobs.length < max && (
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
