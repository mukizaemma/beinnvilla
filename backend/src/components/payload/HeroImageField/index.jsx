'use client'

import React, { useEffect, useState } from 'react'
import { FieldLabel, useField, useListDrawer } from '@payloadcms/ui'
import { formatBytes, prepareUploadFile, uploadPreparedFile } from '../prepareImage.js'
import './heroImageField.css'

function mediaId(value) {
  if (!value) return ''
  if (typeof value === 'object') return value.id || value._id || ''
  return value
}

function mediaSrc(doc) {
  if (!doc || typeof doc !== 'object') return ''
  return doc.thumbnailURL || doc.sizes?.thumbnail?.url || doc.url || ''
}

export function HeroImageField({ field, path, readOnly }) {
  const { value, setValue } = useField({ path })
  const [doc, setDoc] = useState(typeof value === 'object' ? value : null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [ListDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    uploads: true,
  })

  const id = mediaId(value)
  const src = mediaSrc(doc)

  useEffect(() => {
    if (!id) {
      setDoc(null)
      return undefined
    }
    if (typeof value === 'object' && mediaSrc(value)) {
      setDoc(value)
      return undefined
    }

    let cancelled = false
    fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((next) => {
        if (!cancelled && next) setDoc(next)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [id, value])

  async function onFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const prepared = await prepareUploadFile(file)
      const next = await uploadPreparedFile(prepared.file)
      setDoc(next)
      setValue(next.id || next)
      setNote(
        prepared.resized
          ? `${formatBytes(prepared.originalSize)} → ${formatBytes(prepared.finalSize)} resized`
          : '',
      )
    } catch {
      window.alert('Could not upload this image.')
    } finally {
      setBusy(false)
    }
  }

  function applyDoc(next) {
    if (!next) return
    setDoc(next)
    setValue(next.id || next)
    closeDrawer()
  }

  return (
    <div className="hero-image-field field-type upload">
      <FieldLabel
        label={field?.label || 'Background image'}
        path={path}
        required={Boolean(field?.required)}
      />
      <div className="hero-image-field__card">
        {src ? (
          <img src={src} alt="" className="hero-image-field__thumb" />
        ) : (
          <div className="hero-image-field__empty">No image</div>
        )}
        {!readOnly && (
          <>
            <div className={`hero-image-field__actions${id ? '' : ' hero-image-field__actions--single'}`}>
              <label className="hero-image-field__btn">
                {busy ? 'Uploading…' : src ? 'Replace' : 'Upload'}
                <input type="file" accept="image/*" hidden disabled={busy} onChange={onFile} />
              </label>
              {id ? (
                <button
                  type="button"
                  className="hero-image-field__btn hero-image-field__remove"
                  onClick={() => {
                    setDoc(null)
                    setValue(null)
                  }}
                >
                  Remove
                </button>
              ) : null}
            </div>
            <button type="button" className="hero-image-field__library" onClick={openDrawer} disabled={busy}>
              From library
            </button>
            {note ? <small className="hero-image-field__note">{note}</small> : null}
          </>
        )}
      </div>
      <ListDrawer
        onSelect={(args) => {
          applyDoc(args?.doc || args?.value || args)
        }}
      />
    </div>
  )
}
