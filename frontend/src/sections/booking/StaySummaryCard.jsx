import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCart, useCartActions } from '@lib/cart/CartContext';
import { useBooking } from '@lib/booking/BookingContext';
import { calcEstimatedTotal, nightlyRate } from '@lib/booking/pricing';
import ExperiencePicker from './ExperiencePicker';
import styles from './StaySummaryCard.module.css';

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function StaySummaryCard() {
  const { rooms, experiences } = useCart();
  const { removeExperience } = useCartActions();
  const { stay, nights } = useBooking();
  const [pickerOpen, setPickerOpen] = useState(false);
  const estimatedTotal = calcEstimatedTotal(rooms, nights, experiences, {
    includeBreakfast: stay.includeBreakfast,
  });

  const dateRangeLabel =
    stay.checkIn && stay.checkOut
      ? `${formatDate(stay.checkIn)} → ${formatDate(stay.checkOut)}`
      : 'Dates not set yet';

  return (
    <aside className={styles.card}>
      <div className={styles.header}>Your stay summary</div>

      <div className={styles.body}>
        <p className={styles.dates}>
          {dateRangeLabel} · BE Inn Villa
        </p>

        {rooms.length === 0 && experiences.length === 0 ? (
          <p className={styles.emptyNote}>No room is in this stay yet.</p>
        ) : (
          <ul className={styles.roomList}>
            {rooms.map((room) => {
              const rate = nightlyRate(room, stay.includeBreakfast)
              return (
              <li key={room.roomId} className={styles.roomLine}>
                <div className={styles.roomLineTop}>
                  <span className={styles.roomName}>{room.name}</span>
                </div>
                <p className={styles.roomMeta}>
                  {nights > 0 ? `${nights} night(s) · ` : ''}
                  {stay.includeBreakfast ? 'with breakfast' : 'without breakfast'}
                </p>
                <p className={styles.roomPrice}>
                  ${(nights > 0 ? rate * nights : rate).toFixed(2)}
                </p>
              </li>
              )
            })}

            {experiences.map((exp) => (
              <li key={exp.experienceId} className={styles.roomLine}>
                <div className={styles.roomLineTop}>
                  <span className={styles.roomName}>{exp.name}</span>
                  <button
                    type="button"
                    className={styles.removeLink}
                    onClick={() => removeExperience(exp.experienceId)}
                  >
                    Remove
                  </button>
                </div>
                <p className={styles.roomMeta}>Experience · one-time</p>
                <p className={styles.roomPrice}>${exp.price.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className={styles.addExperienceBtn} onClick={() => setPickerOpen(true)}>
          <Plus size={14} />
          Add experience
        </button>
      </div>

      <div className={styles.footer}>
        <div className={styles.totalRow}>
          <span>Estimated total</span>
          <span className={styles.totalValue}>${estimatedTotal.toFixed(2)}</span>
        </div>
      </div>

      {pickerOpen && <ExperiencePicker onClose={() => setPickerOpen(false)} />}
    </aside>
  );
}