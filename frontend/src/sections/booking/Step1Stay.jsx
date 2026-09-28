import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Sparkles } from 'lucide-react';
import { useCart, useCartActions } from '@lib/cart/CartContext';
import { useBooking } from '@lib/booking/BookingContext';
import { useAvailability } from '@lib/queries/useAvailability';
import { useRoomsPage } from '@lib/queries/useRoomsPage';
import { pickApartment } from '@features/hotel/adapters';
import { findBlockingClosure, guestClosureMessage } from '@features/hotel/availability';
import { nightlyRate } from '@lib/booking/pricing';
import StayDatePicker from '@components/hotel/StayDatePicker';
import ExperiencePicker from './ExperiencePicker';
import styles from './Step1Stay.module.css';

export default function Step1Stay() {
  const { rooms, roomCount, experiences } = useCart();
  const { addRoom, removeRoom } = useCartActions();
  const { stay, nights, setStay } = useBooking();
  const { data: closures = [] } = useAvailability();
  const { data: roomsPage } = useRoomsPage();
  const apartment = pickApartment(roomsPage?.rooms || []);
  const [experiencePickerOpen, setExperiencePickerOpen] = useState(false);
  const blocked = findBlockingClosure(closures, {
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    roomSlugs: rooms.map((room) => room.roomId),
  });

  useEffect(() => {
    if (!apartment) return
    rooms.filter((room) => room.roomId !== apartment.id).forEach((room) => removeRoom(room.roomId))
    if (!rooms.some((room) => room.roomId === apartment.id)) addRoom(apartment)
  }, [addRoom, apartment, removeRoom, rooms])

  if (roomCount === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.empty}>
          <CalendarDays size={28} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Book a room at BE Inn Villa</h2>
          <p className={styles.emptyText}>
            Twenty rooms in Kanombe–Busanza, for a couple, a single guest, or a group. Go back to
            the house if you want to see the stay first.
          </p>
          <Link to="/#rooms" className={styles.emptyLink}>
            See the rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Your stay</h2>
      <p className={styles.subtitle}>
        Choose dates, how many guests, and whether breakfast is included. One room, or the house for a group.
      </p>
      {blocked && stay.checkIn && stay.checkOut && (
        <p className={styles.dateError}>{guestClosureMessage(blocked)}</p>
      )}

      <StayDatePicker
        checkIn={stay.checkIn}
        checkOut={stay.checkOut}
        closures={closures}
        roomSlugs={rooms.map((room) => room.roomId)}
        onChange={(next) => setStay({ checkIn: next.checkIn, checkOut: next.checkOut })}
      />

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Adults *</span>
          <input
            type="number"
            min={1}
            value={stay.adults}
            onChange={(e) => setStay({ adults: Math.max(1, Number(e.target.value) || 1) })}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Children</span>
          <input
            type="number"
            min={0}
            value={stay.children}
            onChange={(e) => setStay({ children: Math.max(0, Number(e.target.value) || 0) })}
          />
        </label>
      </div>

      <label className={styles.breakfast}>
        <input
          type="checkbox"
          checked={Boolean(stay.includeBreakfast)}
          onChange={(e) => setStay({ includeBreakfast: e.target.checked })}
        />
        <span>
          Include breakfast for the group
          <small>$200 a night with breakfast, $150 without. Boat for guests staying in the apartment.</small>
        </span>
      </label>

      {nights > 0 && (
        <span className={styles.nightsPill}>
          {nights} {nights === 1 ? 'night' : 'nights'}
          {nights >= 28 ? ' · monthly rate may apply ($2,500)' : ''}
        </span>
      )}
      {stay.checkIn && stay.checkOut && nights <= 0 && (
        <p className={styles.dateError}>Check-out must be after check-in.</p>
      )}

      <div className={styles.roomList}>
        {rooms.map((room) => (
          <div key={room.roomId} className={styles.roomCard}>
            <div>
              <p className={styles.roomName}>{room.name}</p>
              <p className={styles.roomDates}>
                {stay.checkIn && stay.checkOut
                  ? `${stay.checkIn} → ${stay.checkOut}`
                  : 'Set dates above'}
                {` · $${nightlyRate(room, stay.includeBreakfast)} / night`}
              </p>
            </div>
          </div>
        ))}

        {experiences.map((exp) => (
          <div key={exp.experienceId} className={styles.roomCard}>
            <div>
              <p className={styles.roomName}>{exp.name}</p>
              <p className={styles.roomDates}>${exp.price} · experience</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.addExperienceBtn} onClick={() => setExperiencePickerOpen(true)}>
          <Sparkles size={15} />
          Add kayaking or a hike
        </button>
      </div>

      {experiencePickerOpen && (
        <ExperiencePicker onClose={() => setExperiencePickerOpen(false)} />
      )}
    </div>
  );
}
