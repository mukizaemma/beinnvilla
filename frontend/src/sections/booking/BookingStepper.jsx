import { Check } from 'lucide-react';
import styles from './BookingStepper.module.css';

const STEPS = [
  { number: 1, label: 'Stay' },
  { number: 2, label: 'Guest' },
  { number: 3, label: 'Confirm' },
];

export default function BookingStepper({ currentStep }) {
  return (
    <ol className={styles.stepper} aria-label="Booking progress">
      {STEPS.map((step, i) => {
        const isComplete = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <li key={step.number} className={styles.stepWrap}>
            <div className={styles.step}>
              <span
                className={`${styles.circle} ${isComplete ? styles.circleComplete : ''} ${
                  isActive ? styles.circleActive : ''
                }`}
              >
                {isComplete ? <Check size={14} /> : step.number}
              </span>
              <span className={`${styles.label} ${isActive ? styles.labelActive : ''}`}>
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <span
                className={`${styles.connector} ${isComplete ? styles.connectorComplete : ''}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}