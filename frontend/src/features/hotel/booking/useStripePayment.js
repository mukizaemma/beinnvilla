/**
 * Thin wrapper around POST /api/payments/stripe/create-intent (see
 * backend). Booking must already exist — Stripe needs a real
 * amount and a bookingId to attach as metadata before it can create a
 * PaymentIntent.
 */
import { useState } from 'react';
import axios from 'axios';
import { CMS_URL } from '@lib/apiClient';

// 'idle' | 'creating' | 'ready' | 'not-configured' | 'error'
export function useStripePayment() {
  const [status, setStatus] = useState('idle');
  const [clientSecret, setClientSecret] = useState(null);

  async function createIntent(bookingId) {
    setStatus('creating');
    try {
      const res = await axios.post(`${CMS_URL}/api/payments/stripe/create-intent`, { bookingId });
      setClientSecret(res.data.clientSecret);
      setStatus('ready');
      return true;
    } catch (err) {
      setStatus(err.response?.status === 501 ? 'not-configured' : 'error');
      return false;
    }
  }

  // Probe without a booking so we can tell the guest to pick another
  // method *before* creating a reservation they can't pay for.
  async function checkConfigured() {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setStatus('not-configured');
      return false;
    }
    try {
      await axios.post(`${CMS_URL}/api/payments/stripe/create-intent`, {});
      return true;
    } catch (err) {
      if (err.response?.status === 501) {
        setStatus('not-configured');
        return false;
      }
      return true;
    }
  }

  function reset() {
    setStatus('idle');
    setClientSecret(null);
  }

  return { status, clientSecret, createIntent, checkConfigured, reset };
}