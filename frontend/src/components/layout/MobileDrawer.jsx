import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { PUBLIC_CTA, PUBLIC_NAV } from '@features/hotel/brand'
import styles from './MobileDrawer.module.css'

export default function MobileDrawer({ isOpen, onClose }) {
  const primaryNav = PUBLIC_NAV
  const navCTA = PUBLIC_CTA

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <aside
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <X size={24} />
        </button>

        <nav className={styles.nav} aria-label="Mobile primary">
          {primaryNav.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onClose} className={styles.navLink}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to={navCTA.path} onClick={onClose} className={styles.ctaBtn}>
            {navCTA.label}
          </NavLink>
        </nav>
      </aside>
    </div>
  )
}
