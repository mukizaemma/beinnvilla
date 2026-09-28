import { X, Plus } from 'lucide-react';
import { useExperiences } from '@lib/queries/useExperiences';
import { useCart, useCartActions } from '@lib/cart/CartContext';
import styles from './ExperiencePicker.module.css';

export default function ExperiencePicker({ onClose }) {
  const { data, isLoading, isError } = useExperiences();
  const { isExperienceInCart } = useCart();
  const { addExperience } = useCartActions();

  const availableExperiences = (data || []).filter((exp) => !isExperienceInCart(exp.id));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Add an experience"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Add an Experience</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.list}>
          {isLoading && <p className={styles.note}>Loading experiences…</p>}
          {isError && (
            <p className={styles.note}>Couldn't load experiences right now — please try again.</p>
          )}
          {!isLoading && !isError && availableExperiences.length === 0 && (
            <p className={styles.note}>
              {data?.length ? 'Every experience is already in your stay.' : 'No experiences available yet.'}
            </p>
          )}

          {availableExperiences.map((exp) => (
            <div key={exp.id} className={styles.row}>
              <div>
                <h3 className={styles.name}>{exp.name}</h3>
                <p className={styles.price}>${exp.price}</p>
              </div>
              <button type="button" className={styles.addBtn} onClick={() => addExperience(exp)}>
                <Plus size={15} />
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}