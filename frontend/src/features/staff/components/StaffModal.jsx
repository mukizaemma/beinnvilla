import { useEffect } from 'react'
import { X } from 'lucide-react'
import styles from './StaffModal.module.css'

export default function StaffModal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={`${styles.dialog} ${wide ? styles.wide : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="staff-modal-title">{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
