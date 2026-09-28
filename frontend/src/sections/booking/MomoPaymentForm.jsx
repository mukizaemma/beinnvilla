import { useEffect, useRef, useState } from 'react';
import { Smartphone, AlertCircle } from 'lucide-react';
import styles from './MomoPaymentForm.module.css';

export default function MomoPaymentForm({
  bookingId,
  status,
  requestPayment,
  onSuccess,
  onChooseAnother,
}) {
  const [phone, setPhone] = useState('');
  const firedRef = useRef(false);

  useEffect(() => {
    if (status === 'paid' && !firedRef.current) {
      firedRef.current = true;
      onSuccess();
    }
  }, [status, onSuccess]);

  const handleRequest = () => {
    if (!phone) return;
    requestPayment(bookingId, phone);
  };

  if (status === 'not-configured') {
    return (
      <div className={styles.error}>
        <AlertCircle size={15} />
        <div>
          <p>Mobile Money isn't fully connected yet.</p>
          {onChooseAnother && (
            <button type="button" className={styles.switchBtn} onClick={onChooseAnother}>
              Choose another payment method
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Mobile Money number</span>
        <input
          type="tel"
          placeholder="+250 7XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={status === 'requesting' || status === 'pending'}
        />
      </label>

      <button
        type="button"
        className={styles.requestBtn}
        onClick={handleRequest}
        disabled={!phone || status === 'requesting' || status === 'pending'}
      >
        <Smartphone size={15} />
        {status === 'pending' ? 'Waiting for approval…' : 'Send Payment Request'}
      </button>

      {status === 'pending' && (
        <p className={styles.note}>
          Check your phone — approve the payment prompt to complete your booking.
        </p>
      )}
      {status === 'failed' && (
        <p className={styles.error}>
          <AlertCircle size={15} />
          The payment was declined or failed. You can try again.
        </p>
      )}
      {status === 'timed-out' && (
        <p className={styles.error}>
          <AlertCircle size={15} />
          We didn't see an approval in time — try again, or check your Mobile Money app.
        </p>
      )}
      {status === 'error' && (
        <p className={styles.error}>
          <AlertCircle size={15} />
          Something went wrong sending that request. Please try again.
        </p>
      )}
    </div>
  );
}
