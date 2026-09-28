'use client'

import React, { useMemo, useState } from 'react'
import { FieldLabel, useField, useListDrawer } from '@payloadcms/ui'
import { formatBytes, prepareUploadFiles, uploadPreparedFile } from '../prepareImage.js'
import './mediaGridField.css'

function mediaId(value) {
  if (!value) return ''
  if (typeof value === 'object') return value.id || value._id || ''
  return String(value)
}

function mediaSrc(doc) {
  if (!doc || typeof doc !== 'object') return ''
  return doc.thumbnailURL || doc.sizes?.thumbnail?.url || doc.url || ''
}

function imageKey(field) {
  const upload = (field?.fields || []).find((item) => item.type === 'upload' || item.name === 'photo' || item.name === 'image')
  return upload?.name || 'photo'
}

export function MediaGridField({ field, path, readOnly }) {
  const { value, setValue } = useField({ path })
  const key = useMemo(() => imageKey(field), [field])
  const rows = Array.isArray(value) ? value : []
  const max = field?.maxRows || 24
  const [queue, setQueue] = useState([])
  const [busy, setBusy] = useState(false)
  const [ListDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    uploads: true,
  })

  async function pickFiles(event) {
    const files = event.target.files
    event.target.value = ''
    if (!files?.length) return
    const room = Math.max(0, max - rows.length)
    if (!room) return
    setBusy(true)
    try {
      setQueue(await prepareUploadFiles(Array.from(files).slice(0, room)))
    } catch {
      window.alert('Could not prepare these images.')
    } finally {
      setBusy(false)
    }
  }

  async function uploadQueue() {
    if (!queue.length) return
    setBusy(true)
    try {
      const uploaded = []
      for (const item of queue) {
        const doc = await uploadPreparedFile(item.file)
        uploaded.push({ [key]: doc.id || doc })
      }
      setValue([...rows, ...uploaded].slice(0, max))
      queue.forEach((item) => URL.revokeObjectURL(item.preview))
      setQueue([])
    } catch {
      window.alert('Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  function removeAt(index) {
    setValue(rows.filter((_, i) => i !== index))
  }

  return (
    <div className="media-grid-field">
      <FieldLabel label={field?.label || field?.labels?.plural || 'Photos'} path={path} />
      <p className="media-grid-field__hint">
        Add several photos at once. Files over 700KB are resized before upload.
      </p>

      <div className="media-grid-field__grid">
        {rows.map((row, index) => {
          const doc = typeof row?.[key] === 'object' ? row[key] : null
          const src = mediaSrc(doc)
          return (
            <article key={mediaId(row?.[key]) || index}>
              {src ? <img src={src} alt="" /> : <div className="media-grid-field__empty">Photo {index + 1}</div>}
              {!readOnly && (
                <button type="button" onClick={() => removeAt(index)}>
                  Remove
                </button>
              )}
            </article>
          )
        })}
      </div>

      {queue.length > 0 && (
        <div className="media-grid-field__queue">
          <strong>Ready to upload ({queue.length})</strong>
          <div className="media-grid-field__grid">
            {queue.map((item, index) => (
              <article key={`${item.file.name}-${index}`}>
                <img src={item.preview} alt={item.file.name} />
                <small>
                  {item.resized
                    ? `${formatBytes(item.originalSize)} → ${formatBytes(item.finalSize)} resized`
                    : `${formatBytes(item.finalSize)} kept as-is`}
                </small>
              </article>
            ))}
          </div>
          <div className="media-grid-field__actions">
            <button type="button" onClick={uploadQueue} disabled={busy}>
              {busy ? 'Uploading…' : `Upload ${queue.length}`}
            </button>
            <button
              type="button"
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

      {!readOnly && rows.length < max && queue.length === 0 && (
        <div className="media-grid-field__actions">
          <label>
            Add images
            <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={pickFiles} />
          </label>
          <button type="button" onClick={openDrawer} disabled={busy}>
            From library
          </button>
        </div>
      )}

      <ListDrawer
        onSelect={(args) => {
          const doc = args?.doc || args?.value || args
          const id = mediaId(doc)
          if (!id || rows.length >= max) return
          if (rows.some((row) => mediaId(row?.[key]) === id)) return
          setValue([...rows, { [key]: id }])
          closeDrawer()
        }}
      />
    </div>
  )
}
