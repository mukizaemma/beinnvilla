/**
 * Wraps the two MoMo routes in backend: kicks off a Request to
 * Pay, then polls /api/payments/momo/status until MTN reports something
 * other than PENDING. Stops polling after ~2 minutes (guests who
 * haven't approved the USSD prompt by then are told to retry rather
 * than left staring at a spinner forever).
 */
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { CMS_URL } from '@lib/apiClient';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

// 'idle' | 'requesting' | 'pending' | 'paid' | 'failed' | 'timed-out' | 'not-configured' | 'error'
export function useMomoPayment() {
  const [status, setStatus] = useState('idle');
  const pollHandle = useRef(null);

  function stopPolling() {
    if (pollHandle.current) {
      clearInterval(pollHandle.current);
      pollHandle.current = null;
    }
  }

  useEffect(() => () => stopPolling(), []);

  async function checkConfigured() {
    try {
      await axios.post(`${CMS_URL}/api/payments/momo/request-to-pay`, {});
      return true;
    } catch (err) {
      if (err.response?.status === 501) {
        setStatus('not-configured');
        return false;
      }
      return true;
    }
  }

  async function requestPayment(bookingId, phoneNumber) {
    setStatus('requesting');
    let referenceId;
    try {
      const res = await axios.post(`${CMS_URL}/api/payments/momo/request-to-pay`, {
        bookingId,
        phoneNumber,
      });
      referenceId = res.data.referenceId;
    } catch (err) {
      setStatus(err.response?.status === 501 ? 'not-configured' : 'error');
      return;
    }

    setStatus('pending');
    const startedAt = Date.now();

    pollHandle.current = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        stopPolling();
        setStatus('timed-out');
        return;
      }
      try {
        const res = await axios.get(`${CMS_URL}/api/payments/momo/status`, {
          params: { referenceId, bookingId },
        });
        if (res.data.status === 'SUCCESSFUL') {
          stopPolling();
          setStatus('paid');
        } else if (res.data.status === 'FAILED') {
          stopPolling();
          setStatus('failed');
        }
        // else still PENDING — keep polling
      } catch {
        // A single failed poll isn't fatal — network hiccups happen;
        // just try again on the next tick rather than aborting.
      }
    }, POLL_INTERVAL_MS);
  }

  function reset() {
    stopPolling();
    setStatus('idle');
  }

  return { status, requestPayment, checkConfigured, reset, stopPolling };
}