import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { mediaUrl } from '@features/hotel/adapters'
import { GALLERY_CATEGORIES } from '@features/hotel/gallery/categories'
import { mediaId, staffClient } from '../api/staffClient'
import { chosenFiles, formatBytes, prepareUploadFile, uploadMediaFile } from '../lib/prepareImage'
import MediaLibraryPicker from '../components/MediaLibraryPicker'
import '../staff.css'
import fieldStyles from '../components/MediaField.module.css'

const categories = [
  { id: 'none', label: 'None — hide from gallery' },
  ...GALLERY_CATEGORIES.filter((item) => item.id !== 'all'),
]

export default function StaffGallery() {
  const [rows, setRows] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [queue, setQueue] = useState([])
  const [busy, setBusy] = useState(false)

  async function migrateLegacyIfNeeded(existing) {
    if (existing.length) return
    const { data } = await staffClient.get('/api/gallery-photos?limit=200&depth=1')
    const photos = data.docs || []
    if (!photos.length) return
    await Promise.all(
      photos.map((row, index) => {
        const id = mediaId(row.photo)
        if (!id) return null
        return staffClient.patch(`/api/media/${id}`, {
          showOnGallery: true,
          galleryOrder: index + 1,
          galleryCategory: row.category || 'rooms',
          alt: row.caption || undefined,
        })
      }),
    )
  }

  async function load() {
    const first = await staffClient.get('/api/media', {
      params: {
        limit: 200,
        sort: 'galleryOrder,-createdAt',
        'where[and][0][showOnGallery][equals]': true,
        'where[and][1][mimeType][contains]': 'image',
      },
    })
    let docs = first.data.docs || []
    if (!docs.length) {
      await migrateLegacyIfNeeded(docs)
      const again = await staffClient.get('/api/media', {
        params: {
          limit: 200,
          sort: 'galleryOrder,-createdAt',
          'where[and][0][showOnGallery][equals]': true,
          'where[and][1][mimeType][contains]': 'image',
        },
      })
      docs = again.data.docs || []
    }
    setRows(docs)
  }

  useEffect(() => {
    load().catch(() => toast.error('Could not load the website gallery.'))
  }, [])

  async function saveOrder(nextRows) {
    setRows(nextRows)
    try {
      await Promise.all(
        nextRows.map((row, index) =>
          staffClient.patch(`/api/media/${row.id}`, { galleryOrder: index + 1, showOnGallery: true }),
        ),
      )
    } catch {
      toast.error('Could not save the new order.')
      load()
    }
  }

  function move(index, direction) {
    const next = index + direction
    if (next < 0 || next >= rows.length) return
    const copy = [...rows]
    const [item] = copy.splice(index, 1)
    copy.splice(next, 0, item)
    saveOrder(copy)
  }

  async function hide(id) {
    try {
      await staffClient.patch(`/api/media/${id}`, { showOnGallery: false })
      toast.success('Removed from the website gallery.')
      load()
    } catch {
      toast.error('Could not remove this photo.')
    }
  }

  async function addFromLibrary(files) {
    const list = Array.isArray(files) ? files : [files]
    try {
      await Promise.all(
        list.map((file) =>
          staffClient.patch(`/api/media/${file.id}`, {
            showOnGallery: true,
            galleryOrder: 0,
            galleryCategory: file.galleryCategory || 'rooms',
          }),
        ),
      )
      toast.success(list.length === 1 ? 'Added to the website gallery.' : `${list.length} photos added.`)
      load()
    } catch {
      toast.error('Could not add this photo.')
    }
  }

  async function pickFiles(event) {
    const files = chosenFiles(event)
    if (!files.length) return
    const immediate = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      resized: false,
      originalSize: file.size,
      finalSize: file.size,
    }))
    setQueue((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.preview))
      return immediate
    })
    const prepared = await Promise.all(files.map(async (file, index) => {
      try {
        return await prepareUploadFile(file)
      } catch {
        return immediate[index]
      }
    }))
    setQueue((current) => {
      if (!current.some((item) => item.preview === immediate[0]?.preview)) {
        prepared.forEach((item) => {
          if (!immediate.some((shown) => shown.preview === item.preview)) URL.revokeObjectURL(item.preview)
        })
        return current
      }
      immediate.forEach((item, index) => {
        if (prepared[index]?.preview !== item.preview) URL.revokeObjectURL(item.preview)
      })
      return prepared
    })
  }

  async function uploadQueue() {
    if (!queue.length) return
    setBusy(true)
    try {
      for (const item of queue) {
        const doc = await uploadMediaFile(staffClient, item.file, { alt: item.file.name })
        await staffClient.patch(`/api/media/${doc.id}`, {
          showOnGallery: true,
          galleryCategory: 'rooms',
        })
      }
      toast.success(`${queue.length} image${queue.length === 1 ? '' : 's'} uploaded.`)
      queue.forEach((item) => URL.revokeObjectURL(item.preview))
      setQueue([])
      load()
    } catch {
      toast.error('Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  async function setCategory(id, galleryCategory) {
    try {
      await staffClient.patch(`/api/media/${id}`, {
        galleryCategory,
        showOnGallery: galleryCategory !== 'none',
      })
      setRows((current) => current.map((row) => (row.id === id ? { ...row, galleryCategory } : row)))
    } catch {
      toast.error('Could not update the category.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Website gallery</h1>
      <p className="staffLead">
        Upload photos of the apartment. New files are tagged The apartment and appear on the
        homepage (latest 4) and the full Gallery page. Files over 700KB are resized first.
      </p>
      <div className="staffToolbar">
        <label className="staffBtn">
          Add images
          <input type="file" accept="image/*" multiple hidden onChange={pickFiles} />
        </label>
        <button type="button" className="staffBtn staffBtnGhost" onClick={() => setPickerOpen(true)}>
          From library
        </button>
      </div>
      {queue.length > 0 && (
        <div className="staffCard" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <strong>Ready to upload ({queue.length})</strong>
          <div className={fieldStyles.grid} style={{ marginTop: '0.75rem' }}>
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
            <button
              type="button"
              className="staffBtn staffBtnGhost"
              disabled={busy}
              onClick={() => {
                queue.forEach((item) => URL.revokeObjectURL(item.preview))
                setQueue([])
              }}
            >
              Cancel
            </button>
            <button type="button" className="staffBtn" onClick={uploadQueue} disabled={busy}>
              {busy ? 'Uploading…' : `Upload ${queue.length} image${queue.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      )}

      <div className={fieldStyles.grid}>
        {rows.map((row, index) => (
          <article key={row.id} className={fieldStyles.queueItem}>
            <img src={mediaUrl(row)} alt={row.alt || row.filename} />
            <div>
              <p>{row.alt || row.filename}</p>
              <label className="staffField" style={{ margin: '0.4rem 0' }}>
                Category
                <select
                  value={row.galleryCategory || 'rooms'}
                  onChange={(e) => setCategory(row.id, e.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rowActions">
                <button type="button" className="staffBtn staffBtnGhost" onClick={() => move(index, -1)} disabled={index === 0}>
                  Up
                </button>
                <button
                  type="button"
                  className="staffBtn staffBtnGhost"
                  onClick={() => move(index, 1)}
                  disabled={index === rows.length - 1}
                >
                  Down
                </button>
                <button type="button" className="staffBtn staffBtnDanger" onClick={() => hide(row.id)}>
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {rows.length === 0 && (
        <p className="staffLead">No photos on the website gallery yet. Upload them under Media or add from the library.</p>
      )}

      <MediaLibraryPicker
        open={pickerOpen}
        title="Add an existing image to the gallery"
        onClose={() => setPickerOpen(false)}
        multiple
        onSelectMany={addFromLibrary}
      />
    </div>
  )
}
