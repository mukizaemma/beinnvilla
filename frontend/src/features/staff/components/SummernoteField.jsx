import { useEffect, useRef } from 'react'
import $ from 'jquery'
import 'summernote/dist/summernote-lite.css'
import styles from './SummernoteField.module.css'

export default function SummernoteField({ label, value, onChange, height = 180, className = 'full' }) {
  const holder = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const el = holder.current
    if (!el) return undefined

    window.jQuery = window.$ = $
    let cancelled = false

    import('summernote/dist/summernote-lite.js').then(() => {
      if (cancelled || !holder.current) return
      const $el = $(holder.current)
      $el.summernote({
        height,
        disableDragAndDrop: true,
        dialogsInBody: true,
        toolbar: [
          ['style', ['bold', 'italic', 'underline', 'clear']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['insert', ['link']],
        ],
        callbacks: {
          onChange(contents) {
            onChangeRef.current(contents)
          },
        },
      })
      $el.summernote('code', value || '')
    })

    return () => {
      cancelled = true
      try {
        if (holder.current) $(holder.current).summernote('destroy')
      } catch {
        // editor already removed with the modal
      }
    }
    // Mount once per modal open; parent remounts this field with a new key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <label className={`staffField ${className} ${styles.wrap}`}>
      {label}
      <textarea ref={holder} defaultValue={value} />
    </label>
  )
}
