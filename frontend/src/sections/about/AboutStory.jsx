import { useInView } from '@hooks/useInView';
import { useAboutPage } from '@lib/queries/useAboutPage';
import styles from './AboutStory.module.css';

export default function AboutStory() {
  const [sectionRef, inView] = useInView(0.2);
  const { data } = useAboutPage();
  const { eyebrow, headline, paragraphs, quote, image } = data.story;

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={`container ${styles.grid}`}>
        <div
          className={`${styles.image} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        />

        <div className={styles.copy}>
          <span className={`${styles.eyebrow} fade-in-up ${inView ? 'is-visible' : ''}`}>
            {eyebrow}
          </span>
          <h2
            className={`${styles.headline} fade-in-up ${inView ? 'is-visible' : ''}`}
            style={{ animationDelay: '0.08s' }}
          >
            {headline}
          </h2>

          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`${styles.paragraph} fade-in-up ${inView ? 'is-visible' : ''}`}
              style={{ animationDelay: `${0.16 + i * 0.08}s` }}
            >
              {paragraph}
            </p>
          ))}

          {quote && (
            <blockquote
              className={`${styles.quote} fade-in-up ${inView ? 'is-visible' : ''}`}
              style={{ animationDelay: `${0.16 + paragraphs.length * 0.08 + 0.08}s` }}
            >
              {quote}
            </blockquote>
          )}
        </div>
      </div>
    </section>
  );
}