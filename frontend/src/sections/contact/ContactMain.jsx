import Reveal from '@components/ui/Reveal';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';
import styles from './ContactMain.module.css';

export default function ContactMain() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.formCol}>
          <ContactForm />
        </Reveal>
        <Reveal className={styles.infoCol} delay={120}>
          <ContactInfo />
        </Reveal>
      </div>
    </section>
  );
}