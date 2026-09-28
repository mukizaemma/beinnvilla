/**
 * BOOKING CONTEXT
 * ─────────────────────────────────────────────────────────────
 * Scoped to the /book flow only (unlike CartContext, which is global).
 * Holds the stay-level details that apply once to the whole booking —
 * dates and total guest count — plus which of the 3 steps is active.
 *
 * Room selection itself is NOT duplicated here — Step1Stay and
 * StaySummaryCard read rooms straight from useCart(), so there's one
 * source of truth for "what's being booked" and one for "the details
 * of that booking."
 *
 * Persisted to sessionStorage (same lifetime reasoning as the cart —
 * survives a refresh mid-flow, clears when the tab closes).
 * ─────────────────────────────────────────────────────────────
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'gv-booking-stay';

const defaultStay = {
  checkIn: '',
  checkOut: '',
  adults: 6,
  children: 0,
  includeBreakfast: false,
};

const defaultGuest = {
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  country: '',
  specialRequests: '',
};

const defaultDetails = {
  paymentMethod: 'pay-at-hotel', // only option today — see pricing plan for adding online payment later
  confirmationMethod: '',
  agreedToTerms: false,
};

function loadInitial() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { step: 1, stay: defaultStay, guest: defaultGuest, details: defaultDetails };
    const parsed = JSON.parse(raw);
    return {
      step: parsed.step && parsed.step >= 1 && parsed.step <= 3 ? parsed.step : 1,
      stay: { ...defaultStay, ...parsed.stay },
      guest: { ...defaultGuest, ...parsed.guest },
      details: { ...defaultDetails, ...parsed.details, confirmationMethod: '' },
    };
  } catch {
    return { step: 1, stay: defaultStay, guest: defaultGuest, details: defaultDetails };
  }
}

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [state, setState] = useState(loadInitial);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Non-fatal — booking still works for the session.
    }
  }, [state]);

  const nights = useMemo(() => {
    const { checkIn, checkOut } = state.stay;
    if (!checkIn || !checkOut) return 0;
    const diffMs = new Date(checkOut) - new Date(checkIn);
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [state.stay.checkIn, state.stay.checkOut]);

  const value = useMemo(
    () => ({
      step: state.step,
      stay: state.stay,
      guest: state.guest,
      details: state.details,
      nights,
      setStay: (patch) =>
        setState((prev) => ({ ...prev, stay: { ...prev.stay, ...patch } })),
      setGuest: (patch) =>
        setState((prev) => ({ ...prev, guest: { ...prev.guest, ...patch } })),
      setDetails: (patch) =>
        setState((prev) => ({ ...prev, details: { ...prev.details, ...patch } })),
      goToStep: (step) => setState((prev) => ({ ...prev, step })),
      nextStep: () => setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 3) })),
      prevStep: () => setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) })),
      // Called after a successful booking submission — clears dates/guest
      // info back to defaults so a stale form doesn't linger if the
      // guest starts a second booking in the same tab.
      reset: () =>
        setState({ step: 1, stay: defaultStay, guest: defaultGuest, details: defaultDetails }),
    }),
    [state, nights],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider');
  return ctx;
}