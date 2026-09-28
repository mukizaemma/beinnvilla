import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '@lib/cart/CartContext';
import { useBooking } from '@lib/booking/BookingContext';
import { calcEstimatedTotal } from '@lib/booking/pricing';
import styles from './BookingFooterBar.module.css';

export default function BookingFooterBar({
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  showContinue = true,
}) {
  const { rooms, experiences } = useCart();
  const { step, nights, stay } = useBooking();
  const estimatedTotal = calcEstimatedTotal(rooms, nights, experiences, {
    includeBreakfast: stay.includeBreakfast,
  });

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.backBtn}
        onClick={onBack}
        disabled={step === 1}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className={styles.center}>
        <span className={styles.total}>${estimatedTotal.toFixed(2)}</span>
        <span className={styles.stepLabel}>Step {step} of 3</span>
      </div>

      {showContinue && (
        <button
          type="button"
          className={styles.continueBtn}
          onClick={onContinue}
          disabled={continueDisabled}
        >
          {continueLabel}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}