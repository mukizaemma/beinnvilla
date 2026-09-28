import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Mail,
  Building2,
  CreditCard,
  Smartphone,
  Send,
} from 'lucide-react';
import { useCart, useCartActions } from '@lib/cart/CartContext';
import { useBooking } from '@lib/booking/BookingContext';
import { useSiteLayout } from '@lib/queries/useSiteLayout';
import {
  useBookingSubmit,
  createBookingRequest,
  sendReceipt,
  buildSummaryText,
} from '@lib/booking/useBookingSubmit';
import { useStripePayment } from '@lib/booking/useStripePayment';
import { useMomoPayment } from '@lib/booking/useMomoPayment';
import { calcEstimatedTotal } from '@lib/booking/pricing';
import { brandFromCompany } from '@features/hotel/companyBrand';
import StripePaymentForm from './StripePaymentForm';
import MomoPaymentForm from './MomoPaymentForm';
import styles from './Step3Confirm.module.css';

const PAYMENT_METHODS = [
  { value: 'pay-at-hotel', label: 'Pay on arrival', icon: Building2 },
  { value: 'stripe', label: 'Card', icon: CreditCard },
  { value: 'momo', label: 'Mobile Money', icon: Smartphone },
  { value: 'western-union', label: 'Western Union', icon: Send },
];

const STRIPE_KEY_SET = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentUnavailableNotice({ children, onChooseAnother }) {
  return (
    <div className={styles.statusError}>
      <AlertCircle size={16} />
      <div className={styles.statusErrorBody}>
        <p>{children}</p>
        <button type="button" className={styles.switchMethodBtn} onClick={onChooseAnother}>
          Choose another payment method
        </button>
      </div>
    </div>
  );
}

export default function Step3Confirm() {
  const { rooms, experiences } = useCart();
  const { clearAll } = useCartActions();
  const { stay, nights, guest, details, setDetails, reset } = useBooking();
  const { data: layout } = useSiteLayout();
  const company = layout?.company;
  const brand = brandFromCompany(company);
  const total = calcEstimatedTotal(rooms, nights, experiences, {
    includeBreakfast: stay.includeBreakfast,
  });
  const guestName = `${guest.firstName} ${guest.lastName}`.trim() || '—';

  // Path 1: "pay at hotel" — create + receipt in one call, unchanged
  // from before online payment existed.
  const { status: hotelStatus, submit: submitPayAtHotel } = useBookingSubmit();

  // Path 2: Stripe/MoMo/Western Union — booking has to exist first so a
  // payment step (or, for WU, just a reference number) has something to
  // attach to. This local state machine drives all three.
  const [onlineStatus, setOnlineStatus] = useState('idle'); // idle | creating | awaiting-payment | success | success-no-receipt | error | not-configured
  const [bookingId, setBookingId] = useState(null);
  const [checkingProvider, setCheckingProvider] = useState(false);
  const stripePayment = useStripePayment();
  const momoPayment = useMomoPayment();

  const isSuccess =
    ['success', 'success-no-receipt'].includes(hotelStatus) ||
    ['success', 'success-no-receipt'].includes(onlineStatus);
  const effectiveStatus = hotelStatus !== 'idle' ? hotelStatus : onlineStatus;
  const submitting = hotelStatus === 'submitting' || onlineStatus === 'creating' || checkingProvider;
  const stripeUnavailable =
    details.paymentMethod === 'stripe' &&
    (!STRIPE_KEY_SET || stripePayment.status === 'not-configured');
  const momoUnavailable = details.paymentMethod === 'momo' && momoPayment.status === 'not-configured';
  const paymentLocked =
    submitting ||
    stripePayment.status === 'creating' ||
    momoPayment.status === 'requesting' ||
    momoPayment.status === 'pending';

  async function finishWithReceipt() {
    const summaryText = buildSummaryText({ rooms, experiences, stay, nights, guest, total });
    const sent = await sendReceipt({
      company,
      confirmationMethod: details.confirmationMethod,
      summaryText,
      guest,
    });
    setOnlineStatus(sent ? 'success' : 'success-no-receipt');
  }

  function chooseAnotherMethod() {
    stripePayment.reset();
    momoPayment.reset();
    setOnlineStatus('idle');
    setDetails({ paymentMethod: '' });
    document.getElementById('booking-payment-methods')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  function selectPaymentMethod(value) {
    if (value === details.paymentMethod) return;
    stripePayment.reset();
    momoPayment.reset();
    if (onlineStatus === 'awaiting-payment' || onlineStatus === 'error') {
      setOnlineStatus('idle');
    }
    setDetails({ paymentMethod: value });
  }

  async function handleConfirm() {
    if (!details.agreedToTerms || !details.paymentMethod || !details.confirmationMethod || submitting) return;
    if (details.confirmationMethod === 'email' && !guest.email) return;

    if (details.paymentMethod === 'stripe') {
      setCheckingProvider(true);
      try {
        const ready = await stripePayment.checkConfigured();
        if (!ready) return;
      } finally {
        setCheckingProvider(false);
      }
    }
    if (details.paymentMethod === 'momo') {
      setCheckingProvider(true);
      try {
        const ready = await momoPayment.checkConfigured();
        if (!ready) return;
      } finally {
        setCheckingProvider(false);
      }
    }

    if (details.paymentMethod === 'pay-at-hotel') {
      if (bookingId) {
        await finishWithReceipt();
        return;
      }
      await submitPayAtHotel({ rooms, experiences, stay, nights, guest, details, total });
      return;
    }

    let id = bookingId;
    if (!id) {
      setOnlineStatus('creating');
      try {
        id = await createBookingRequest({ rooms, experiences, stay, guest, details, total });
      } catch (err) {
        setOnlineStatus(err.code);
        return;
      }
      setBookingId(id);
    }

    if (details.paymentMethod === 'stripe') {
      setOnlineStatus('awaiting-payment');
      await stripePayment.createIntent(id);
    } else if (details.paymentMethod === 'momo') {
      setOnlineStatus('awaiting-payment');
    } else if (details.paymentMethod === 'western-union') {
      await finishWithReceipt();
    }
  }

  if (isSuccess) {
    return (
      <div className={styles.card}>
        <div className={styles.successState}>
          <CheckCircle2 size={32} className={styles.successIcon} />
          <h2 className={styles.successTitle}>Booking confirmed</h2>
          <p className={styles.successText}>
            {effectiveStatus === 'success'
              ? details.confirmationMethod === 'whatsapp'
                ? 'Your reservation is saved. Continue the conversation on WhatsApp to finish up with BE Inn Villa.'
                : "Your reservation is saved, and we've emailed a copy of your booking details."
              : "Your reservation is saved, but we weren't able to send a confirmation receipt automatically — BE Inn Villa will still see your booking and reach out directly."}
          </p>

          {details.paymentMethod === 'western-union' && (
            <div className={styles.wuBox}>
              <p className={styles.wuTitle}>Complete your payment via Western Union</p>
              <p className={styles.wuText}>
                Send ${total.toFixed(2)} to {brand.name} and include your
                booking reference below. Contact us via WhatsApp or phone for the exact receiver
                details to use — we'll confirm your payment once it's received.
              </p>
              {bookingId && <p className={styles.wuReference}>Reference: {bookingId}</p>}
            </div>
          )}

          <button
            type="button"
            className={styles.doneBtn}
            onClick={() => {
              clearAll();
              reset();
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <CheckCircle2 size={18} className={styles.headingIcon} />
        <h2 className={styles.title}>Review &amp; confirm</h2>
      </div>

      <dl className={styles.reviewList}>
        <div className={styles.reviewRow}>
          <dt>Dates</dt>
          <dd>
            {stay.checkIn} → {stay.checkOut}
          </dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>Guest</dt>
          <dd>{guestName}</dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>Items</dt>
          <dd>
            BE Inn Villa{stay.includeBreakfast ? ' with breakfast' : ' without breakfast'}
            {experiences.length ? `, ${experiences.length} experience(s)` : ''}
          </dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>Total</dt>
          <dd className={styles.reviewTotal}>${total.toFixed(2)}</dd>
        </div>
      </dl>

      <h3 className={styles.sectionLabel}>How would you like to pay?</h3>
      <div id="booking-payment-methods" className={styles.paymentGrid}>
        {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            className={`${styles.methodCard} ${
              details.paymentMethod === value ? styles.methodCardActive : ''
            }`}
            onClick={() => selectPaymentMethod(value)}
            disabled={paymentLocked}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
      {details.paymentMethod === 'western-union' && (
        <p className={styles.methodNote}>
          Western Union payments are confirmed manually by our staff after you send the
          transfer — your booking is still saved immediately.
        </p>
      )}

      <h3 className={styles.sectionLabel}>How should we send your confirmation?</h3>
      <div className={styles.methodRow}>
        <button
          type="button"
          className={`${styles.methodCard} ${
            details.confirmationMethod === 'whatsapp' ? styles.methodCardActive : ''
          }`}
          onClick={() => setDetails({ confirmationMethod: 'whatsapp' })}
        >
          <MessageCircle size={16} />
          WhatsApp
        </button>
        <button
          type="button"
          className={`${styles.methodCard} ${
            details.confirmationMethod === 'email' ? styles.methodCardActive : ''
          }`}
          onClick={() => setDetails({ confirmationMethod: 'email' })}
        >
          <Mail size={16} />
          Email
        </button>
      </div>

      <label className={styles.termsRow}>
        <input
          type="checkbox"
          checked={details.agreedToTerms}
          onChange={(e) => setDetails({ agreedToTerms: e.target.checked })}
        />
        <span>
          I have read and agree to the{' '}
          <Link to="/policy">Hotel Policy and Terms &amp; Conditions</Link>
        </span>
      </label>

      {stripeUnavailable && (
        <PaymentUnavailableNotice onChooseAnother={chooseAnotherMethod}>
          Card payments aren't fully connected yet.
        </PaymentUnavailableNotice>
      )}

      {momoUnavailable && onlineStatus !== 'awaiting-payment' && (
        <PaymentUnavailableNotice onChooseAnother={chooseAnotherMethod}>
          Mobile Money isn't fully connected yet.
        </PaymentUnavailableNotice>
      )}

      {/* Online-payment sub-flows render inline once the booking exists */}
      {onlineStatus === 'awaiting-payment' && details.paymentMethod === 'stripe' && !stripeUnavailable && (
        <div className={styles.paymentPanel}>
          {stripePayment.status === 'creating' && <p className={styles.note}>Setting up payment…</p>}
          {stripePayment.status === 'error' && (
            <div className={styles.statusError}>
              <AlertCircle size={16} />
              <div className={styles.statusErrorBody}>
                <p>Couldn't start the payment. Please try again, or pick another method.</p>
                <button type="button" className={styles.switchMethodBtn} onClick={chooseAnotherMethod}>
                  Choose another payment method
                </button>
              </div>
            </div>
          )}
          {stripePayment.status === 'ready' && (
            <StripePaymentForm
              clientSecret={stripePayment.clientSecret}
              total={total}
              onSuccess={finishWithReceipt}
              onChooseAnother={chooseAnotherMethod}
            />
          )}
        </div>
      )}

      {onlineStatus === 'awaiting-payment' && details.paymentMethod === 'momo' && (
        <div className={styles.paymentPanel}>
          <MomoPaymentForm
            bookingId={bookingId}
            status={momoPayment.status}
            requestPayment={momoPayment.requestPayment}
            onSuccess={finishWithReceipt}
            onChooseAnother={chooseAnotherMethod}
          />
        </div>
      )}

      {onlineStatus !== 'awaiting-payment' && (
        <button
          type="button"
          className={styles.confirmBtn}
          onClick={handleConfirm}
          disabled={
            !details.paymentMethod ||
            stripeUnavailable ||
            momoUnavailable ||
            !details.agreedToTerms ||
            !details.confirmationMethod ||
            submitting ||
            (details.confirmationMethod === 'email' && !guest.email)
          }
        >
          {submitting
            ? 'Confirming…'
            : details.paymentMethod === 'pay-at-hotel'
              ? 'Confirm Booking'
              : 'Continue to Payment'}
        </button>
      )}

      {effectiveStatus === 'error' && (
        <p className={styles.statusError}>
          <AlertCircle size={16} />
          Something went wrong saving your booking. Please try again, or reach us directly.
        </p>
      )}

      {effectiveStatus === 'not-configured' && (
        <p className={styles.statusError}>
          <AlertCircle size={16} />
          Online booking submission isn't connected yet — please reach us directly to confirm
          this reservation in the meantime.
        </p>
      )}
    </div>
  );
}
