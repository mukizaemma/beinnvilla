import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { mediaUrl } from '@features/hotel/adapters'
import { GALLERY_CATEGORIES } from '@features/hotel/gallery/categories'
import { staffClient } from '../api/staffClient'
import { formatBytes, prepareUploadFiles, uploadMediaFile } from '../lib/prepareImage'
import '../staff.css'
import fieldStyles from '../components/MediaField.module.css'

const PAGE_SIZE = 18
const categories = [
  { id: 'none', label: 'None — library only' },
  ...GALLERY_CATEGORIES.filter((item) => item.id !== 'all'),
]

export default function StaffMedia() {
  const [page, setPage] = useState(1)
  const [docs, setDocs] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [queue, setQueue] = useState([])
  const [busy, setBusy] = useState(false)
  const [showOnGallery, setShowOnGallery] = useState(false)
  const [galleryCategory, setGalleryCategory] = useState('none')

  async function load(nextPage = page) {
    const { data } = await staffClient.get('/api/media', {
      params: {
        limit: PAGE_SIZE,
        page: nextPage,
        sort: '-createdAt',
        'where[mimeType][contains]': 'image',
      },
    })
    setDocs(data.docs || [])
    setTotalPages(data.totalPages || 1)
    setPage(data.page || nextPage)
  }

  useEffect(() => {
    load(1).catch(() => toast.error('Could not load the media library.'))
  }, [])

  useEffect(() => {
    return () => queue.forEach((item) => URL.revokeObjectURL(item.preview))
  }, [queue])

  async function pickFiles(event) {
    const files = event.target.files
    event.target.value = ''
    if (!files?.length) return
    try {
      const prepared = await prepareUploadFiles(files)
      setQueue((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.preview))
        return prepared
      })
    } catch {
      toast.error('Could not prepare these images.')
    }
  }

  function clearQueue() {
    queue.forEach((item) => URL.revokeObjectURL(item.preview))
    setQueue([])
  }

  async function uploadQueue() {
    if (!queue.length) return
    setBusy(true)
    try {
      for (const item of queue) {
        const doc = await uploadMediaFile(staffClient, item.file, { alt: item.file.name })
        await staffClient.patch(`/api/media/${doc.id}`, {
          alt: item.file.name,
          showOnGallery,
          galleryCategory,
        })
      }
      toast.success(queue.length === 1 ? 'Image uploaded.' : `${queue.length} images uploaded.`)
      clearQueue()
      await load(1)
    } catch {
      toast.error('One or more uploads failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="staffPage">
      <h1>Media gallery</h1>
      <p className="staffLead">
        Upload one or many photos. Files over 700KB are resized first — you will see exactly what will be saved.
      </p>

      <div className="staffToolbar">
        <label className="staffBtn">
          Choose images
          <input type="file" accept="image/*" multiple hidden onChange={pickFiles} />
        </label>
        <label className="staffField">
          Category if added to the website gallery
          <select
            value={galleryCategory}
            onChange={(e) => {
              const next = e.target.value
              setGalleryCategory(next)
              setShowOnGallery(next !== 'none')
            }}
          >
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="staffCheck">
          <input
            type="checkbox"
            checked={showOnGallery}
            onChange={(e) => setShowOnGallery(e.target.checked)}
          />
          Also show on the website Gallery page
        </label>
      </div>

      {queue.length > 0 && (
        <div className="staffCard" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <strong>Ready to upload ({queue.length})</strong>
          <div className={fieldStyles.queue} style={{ marginTop: '0.85rem' }}>
            {queue.map((item, index) => (
              <article key={`${item.file.name}-${index}`} className={fieldStyles.queueItem}>
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
          <div className="formActions">
            <button type="button" className="staffBtn staffBtnGhost" onClick={clearQueue} disabled={busy}>
              Clear
            </button>
            <button type="button" className="staffBtn" onClick={uploadQueue} disabled={busy}>
              {busy ? 'Uploading…' : `Upload ${queue.length} image${queue.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      <div className={`staffCard ${fieldStyles.grid}`} style={{ padding: '1rem' }}>
        {docs.map((file) => (
          <article key={file.id} className={fieldStyles.queueItem}>
            <img src={mediaUrl(file)} alt={file.alt || file.filename} />
            <div>
              <p>{file.alt || file.filename}</p>
              <small>{file.showOnGallery ? 'On website gallery' : 'Library only'}</small>
            </div>
          </article>
        ))}
        {docs.length === 0 && <p>No images yet. Upload the first set above.</p>}
      </div>

      {totalPages > 1 && (
        <div className={fieldStyles.pager}>
          <button type="button" className="staffBtn staffBtnGhost" disabled={page <= 1} onClick={() => load(page - 1)}>
            Previous
          </button>
          <span>
            Latest {PAGE_SIZE} — page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="staffBtn staffBtnGhost"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
