import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { mediaUrl } from '@features/hotel/adapters'
import { mediaId, staffClient } from '../api/staffClient'
import { chosenFiles, prepareUploadFile, uploadMediaFile } from '../lib/prepareImage'
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

  function rememberJobs(next) {
    jobsRef.current = next
    setJobs(next)
  }

  async function uploadJob(job) {
    try {
      const doc = await uploadMediaFile(staffClient, job.file, { alt: job.file.name })
      if (!jobsRef.current.some((item) => item.id === job.id)) return
      const list = itemsRef.current.slice()
      if (Number.isInteger(job.replaceIndex)) {
        if (job.replaceIndex >= list.length) return
        list[job.replaceIndex] = doc
      } else {
        list.push(doc)
      }
      const next = list.slice(0, max)
      itemsRef.current = next
      onChange(next)
      URL.revokeObjectURL(job.preview)
      rememberJobs(jobsRef.current.filter((item) => item.id !== job.id))
    } catch {
      setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, status: 'failed' } : item)))
    }
  }

  function retryJob(job) {
    setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, status: 'uploading' } : item)))
    uploadJob({ ...job, status: 'uploading' })
  }

  async function prepareAndUpload(job) {
    let ready = job
    try {
      const prepared = await prepareUploadFile(job.file)
      if (!jobsRef.current.some((item) => item.id === job.id)) {
        URL.revokeObjectURL(prepared.preview)
        if (prepared.preview !== job.preview) URL.revokeObjectURL(job.preview)
        return
      }
      if (prepared.preview !== job.preview) URL.revokeObjectURL(job.preview)
      ready = { ...job, file: prepared.file, preview: prepared.preview, status: 'uploading' }
      setJobs((current) => current.map((item) => (item.id === job.id ? ready : item)))
    } catch {
      toast.error('Could not prepare one image. The original will be uploaded.')
    }
    uploadJob(ready)
  }

  function pickFiles(event) {
    const selected = chosenFiles(event)
    if (!selected.length) return
    const adding = jobsRef.current.filter((job) => !Number.isInteger(job.replaceIndex)).length
    const room = Math.max(0, max - items.length - adding)
    if (!room) {
      toast.error(`This set already has ${max} photos. Use Replace on a photo to swap it.`)
      return
    }
    const nextJobs = selected.slice(0, room).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
    }))
    rememberJobs([...jobsRef.current, ...nextJobs])
    nextJobs.forEach((job) => prepareAndUpload(job))
  }

  function replaceWithFile(index, event) {
    const [file] = chosenFiles(event)
    if (!file) return
    const previous = jobsRef.current.find((job) => job.replaceIndex === index)
    if (previous) URL.revokeObjectURL(previous.preview)
    const job = {
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      replaceIndex: index,
    }
    rememberJobs([...jobsRef.current.filter((item) => item.replaceIndex !== index), job])
    prepareAndUpload(job)
  }

  function removeJob(job) {
    URL.revokeObjectURL(job.preview)
    rememberJobs(jobsRef.current.filter((item) => item.id !== job.id))
  }

  function removeAt(index) {
    jobsRef.current
      .filter((job) => job.replaceIndex === index)
      .forEach((job) => URL.revokeObjectURL(job.preview))
    rememberJobs(
      jobsRef.current
        .filter((job) => job.replaceIndex !== index)
        .map((job) => (
          Number.isInteger(job.replaceIndex) && job.replaceIndex > index
            ? { ...job, replaceIndex: job.replaceIndex - 1 }
            : job
        )),
    )
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
        {items.map((item, index) => {
          const replacing = jobs.find((job) => job.replaceIndex === index)
          return (
            <article key={mediaId(item) || index} className={styles.photoTile}>
              <img src={replacing?.preview || mediaUrl(item)} alt="" />
              <button type="button" className={styles.removeIcon} onClick={() => removeAt(index)} aria-label="Remove photo">
                <X size={14} />
              </button>
              <div className={styles.tileBar}>
                <small className={replacing?.status === 'failed' ? styles.tileFailed : undefined}>
                  {replacing ? (replacing.status === 'uploading' ? 'Replacing…' : 'Not replaced') : 'Uploaded'}
                </small>
                {replacing?.status === 'failed' ? (
                  <button type="button" className={styles.replace} onClick={() => retryJob(replacing)}>
                    Try again
                  </button>
                ) : (
                  <label className={styles.replace}>
                    Replace
                    <input type="file" accept="image/*" hidden onChange={(event) => replaceWithFile(index, event)} />
                  </label>
                )}
              </div>
            </article>
          )
        })}
        {jobs.filter((job) => !Number.isInteger(job.replaceIndex)).map((job) => (
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

      {items.length + jobs.filter((job) => !Number.isInteger(job.replaceIndex)).length < max && (
        <div className={styles.galleryActions}>
          <label className={styles.btn}>
            {items.length ? 'Add more photos' : 'Add images'}
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
