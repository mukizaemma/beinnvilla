import { useState } from 'react';
import { ChevronRight, User } from 'lucide-react';
import { useBooking } from '@lib/booking/BookingContext';
import styles from './Step2Guest.module.css';

export default function Step2Guest() {
  const { guest, setGuest } = useBooking();
  const [requestsOpen, setRequestsOpen] = useState(Boolean(guest.specialRequests));

  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <User size={18} className={styles.headingIcon} />
        <div>
          <h2 className={styles.title}>Primary guest</h2>
          <p className={styles.subtitle}>We will use these details to confirm your reservation.</p>
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>First name</span>
          <input
            type="text"
            value={guest.firstName}
            onChange={(e) => setGuest({ firstName: e.target.value })}
            required
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Last name</span>
          <input
            type="text"
            value={guest.lastName}
            onChange={(e) => setGuest({ lastName: e.target.value })}
            required
          />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={`${styles.fieldLabel} ${styles.required}`}>Mobile (WhatsApp) *</span>
          <input
            type="tel"
            placeholder="+250 7XX XXX XXX"
            value={guest.mobile}
            onChange={(e) => setGuest({ mobile: e.target.value })}
            required
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <input
            type="email"
            value={guest.email}
            onChange={(e) => setGuest({ email: e.target.value })}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Country / region</span>
        <input
          type="text"
          value={guest.country}
          onChange={(e) => setGuest({ country: e.target.value })}
        />
      </label>

      <button
        type="button"
        className={styles.accordionToggle}
        onClick={() => setRequestsOpen((open) => !open)}
        aria-expanded={requestsOpen}
      >
        <ChevronRight
          size={14}
          className={`${styles.accordionIcon} ${requestsOpen ? styles.accordionIconOpen : ''}`}
        />
        Special requests
      </button>

      {requestsOpen && (
        <textarea
          className={styles.requestsTextarea}
          rows={3}
          placeholder="Anything we should know ahead of your stay?"
          value={guest.specialRequests}
          onChange={(e) => setGuest({ specialRequests: e.target.value })}
        />
      )}
    </div>
  );
}