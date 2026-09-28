import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AlertCircle } from 'lucide-react';
import styles from './StripePaymentForm.module.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
// loadStripe() is safe to call once at module scope — Stripe.js itself
// caches the script load, so re-renders don't re-fetch it.
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

function CheckoutForm({ onSuccess, total }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      // 3DS or another redirect-based method resolved outside this
      // page — Stripe's own webhook (see backend) is the real
      // source of truth for those; this UI just can't confirm it yet.
      setError("We couldn't confirm the payment immediately — check your email or contact us if this persists.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PaymentElement />
      {error && (
        <p className={styles.error}>
          <AlertCircle size={15} />
          {error}
        </p>
      )}
      <button type="button" className={styles.payBtn} onClick={handlePay} disabled={submitting}>
        {submitting ? 'Processing…' : `Pay $${total.toFixed(2)}`}
      </button>
    </div>
  );
}

export default function StripePaymentForm({ clientSecret, total, onSuccess, onChooseAnother }) {
  if (!PUBLISHABLE_KEY) {
    return (
      <div className={styles.error}>
        <AlertCircle size={15} />
        <div>
          <p>Card payments aren't fully connected yet.</p>
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
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} total={total} />
    </Elements>
  );
}