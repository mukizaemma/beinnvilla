'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FieldLabel, useField, useListDrawer } from '@payloadcms/ui'
import { chosenFiles, prepareUploadFile, uploadPreparedFile } from '../prepareImage.js'
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
  const [jobs, setJobs] = useState([])
  const [known, setKnown] = useState({})
  const rowsRef = useRef(rows)
  const jobsRef = useRef(jobs)
  rowsRef.current = rows
  jobsRef.current = jobs
  const uploading = jobs.filter((job) => job.status === 'uploading').length
  const failed = jobs.filter((job) => job.status === 'failed').length
  const [ListDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    uploads: true,
  })

  useEffect(() => {
    return () => jobsRef.current.forEach((job) => URL.revokeObjectURL(job.preview))
  }, [])

  async function uploadJob(job) {
    try {
      const doc = await uploadPreparedFile(job.file)
      if (!jobsRef.current.some((item) => item.id === job.id)) return
      const id = mediaId(doc)
      setKnown((current) => ({ ...current, [id]: doc }))
      const next = [...rowsRef.current, { [key]: id }].slice(0, max)
      rowsRef.current = next
      setValue(next)
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
      window.alert('Could not prepare one image. The original will be uploaded.')
    }
    uploadJob(ready)
  }

  function pickFiles(event) {
    const selected = chosenFiles(event)
    if (!selected.length || readOnly) return
    const room = Math.max(0, max - rows.length - jobsRef.current.length)
    if (!room) return
    const nextJobs = selected.slice(0, room).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
    }))
    const next = [...jobsRef.current, ...nextJobs]
    jobsRef.current = next
    setJobs(next)
    nextJobs.forEach((job) => prepareAndUpload(job))
  }

  function removeJob(job) {
    URL.revokeObjectURL(job.preview)
    setJobs((current) => current.filter((item) => item.id !== job.id))
  }

  function removeAt(index) {
    setValue(rows.filter((_, itemIndex) => itemIndex !== index))
  }

  const status = uploading
    ? `Uploading ${uploading} photo${uploading === 1 ? '' : 's'}. Wait before saving — they are not stored yet.`
    : failed
      ? `${failed} photo${failed === 1 ? '' : 's'} did not upload and will not be saved. Remove or try again.`
      : rows.length
        ? `${rows.length} photo${rows.length === 1 ? '' : 's'} uploaded. You can continue.`
        : 'No gallery photos yet.'

  return (
    <div className="media-grid-field">
      <FieldLabel label={field?.label || field?.labels?.plural || 'Photos'} path={path} />
      <p className="media-grid-field__hint">
        Choose several photos at once. Each one shows here as soon as it is chosen.
      </p>
      <p className={uploading || failed ? 'media-grid-field__status media-grid-field__status--wait' : 'media-grid-field__status'} role="status">
        {status}
      </p>

      <div className="media-grid-field__grid">
        {rows.map((row, index) => {
          const id = mediaId(row?.[key])
          const doc = typeof row?.[key] === 'object' ? row[key] : known[id]
          const src = mediaSrc(doc)
          return (
            <article key={id || index} className="media-grid-field__tile">
              {src ? <img src={src} alt="" /> : <div className="media-grid-field__empty">Photo {index + 1}</div>}
              {!readOnly && (
                <button type="button" className="media-grid-field__remove" onClick={() => removeAt(index)} aria-label="Remove photo">
                  ×
                </button>
              )}
              <small>Uploaded</small>
            </article>
          )
        })}
        {jobs.map((job) => (
          <article key={job.id} className="media-grid-field__tile">
            <img src={job.preview} alt={job.file.name} />
            <button type="button" className="media-grid-field__remove" onClick={() => removeJob(job)} aria-label="Remove photo">
              ×
            </button>
            <small className={job.status === 'failed' ? 'media-grid-field__failed' : undefined}>
              {job.status === 'uploading' ? 'Uploading…' : 'Not uploaded'}
            </small>
            {job.status === 'failed' ? (
              <button type="button" className="media-grid-field__retry" onClick={() => retryJob(job)}>
                Try again
              </button>
            ) : null}
          </article>
        ))}
      </div>

      {!readOnly && rows.length + jobs.length < max && (
        <div className="media-grid-field__actions">
          <label>
            Add images
            <input type="file" accept="image/*" multiple hidden onChange={pickFiles} />
          </label>
          <button type="button" onClick={openDrawer}>
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
          if (typeof doc === 'object') setKnown((current) => ({ ...current, [id]: doc }))
          setValue([...rows, { [key]: id }])
          closeDrawer()
        }}
      />
    </div>
  )
}
