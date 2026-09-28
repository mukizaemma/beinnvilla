import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { mediaUrl } from '@features/hotel/adapters'
import { staffClient } from '../api/staffClient'
import StaffModal from './StaffModal'
import styles from './MediaField.module.css'

const PAGE_SIZE = 18

export default function MediaLibraryPicker({
  open,
  title = 'Choose an existing image',
  imagesOnly = true,
  multiple = false,
  onClose,
  onSelect,
  onSelectMany,
}) {
  const [page, setPage] = useState(1)
  const [docs, setDocs] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [picked, setPicked] = useState([])

  useEffect(() => {
    if (open) {
      setPage(1)
      setPicked([])
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const params = { limit: PAGE_SIZE, page, sort: '-createdAt' }
    if (imagesOnly) params['where[mimeType][contains]'] = 'image'
    staffClient
      .get('/api/media', { params })
      .then((res) => {
        setDocs(res.data.docs || [])
        setTotalPages(res.data.totalPages || 1)
      })
      .catch(() => toast.error('Could not load the media library.'))
      .finally(() => setLoading(false))
  }, [open, page, imagesOnly])

  if (!open) return null

  return (
    <StaffModal title={title} wide onClose={onClose}>
      {loading && <p>Loading…</p>}
      <div className={styles.grid}>
        {docs.map((file) => {
          const selected = picked.some((item) => item.id === file.id)
          return (
            <button
              key={file.id}
              type="button"
              className={`${styles.tile}${selected ? ` ${styles.tileOn}` : ''}`}
              onClick={() => {
                if (!multiple) {
                  onSelect?.(file)
                  onClose()
                  return
                }
                setPicked((current) =>
                  selected ? current.filter((item) => item.id !== file.id) : [...current, file],
                )
              }}
            >
              <img src={mediaUrl(file)} alt={file.alt || file.filename} />
              <span>{file.alt || file.filename}</span>
            </button>
          )
        })}
      </div>
      {multiple && (
        <div className={styles.pager}>
          <button
            type="button"
            className={styles.btn}
            disabled={!picked.length}
            onClick={() => {
              onSelectMany?.(picked)
              onClose()
            }}
          >
            Add {picked.length || ''} selected
          </button>
        </div>
      )}
      {!loading && docs.length === 0 && <p>No files yet. Upload one first.</p>}
      {totalPages > 1 && (
        <div className={styles.pager}>
          <button type="button" className={styles.btn} disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className={styles.btn}
            disabled={page >= totalPages}
            onClick={() => setPage((n) => n + 1)}
          >
            Next
          </button>
        </div>
      )}
    </StaffModal>
  )
}
