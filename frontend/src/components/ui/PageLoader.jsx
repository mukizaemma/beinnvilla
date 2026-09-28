import { Loader2 } from 'lucide-react'
import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <div className={styles.wrapper} role="status" aria-label="Loading page">
      <Loader2 size={28} className={styles.spinner} />
    </div>
  )
}
