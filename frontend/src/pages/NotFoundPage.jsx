import { Link } from 'react-router-dom'
import PagePlaceholder from '@components/ui/PagePlaceholder'
import Reveal from '@components/ui/Reveal'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <Reveal className={styles.wrap}>
      <PagePlaceholder title="404 — Page not found" />
      <p className={styles.back}>
        <Link to="/">Back to home</Link>
      </p>
    </Reveal>
  )
}
