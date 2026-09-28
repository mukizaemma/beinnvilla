import styles from './PagePlaceholder.module.css'

export default function PagePlaceholder({ title }) {
  return (
    <section className={styles.wrapper}>
      <div className="container">
        <p className={styles.eyebrow}>Coming soon</p>
        <h1 className={styles.title}>{title}</h1>
      </div>
    </section>
  )
}
