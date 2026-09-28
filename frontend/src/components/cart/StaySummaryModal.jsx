import { useNavigate } from 'react-router-dom';
import { X, BedDouble, Sparkles, Trash2 } from 'lucide-react';
import { useCart, useCartActions } from '@lib/cart/CartContext';
import styles from './StaySummaryModal.module.css';

export default function StaySummaryModal({ onClose }) {
  const { rooms, experiences, roomCount, experienceCount, grandTotal } = useCart();
  const { removeRoom, removeExperience, clearAll } = useCartActions();
  const navigate = useNavigate();

  const hasItems = roomCount > 0 || experienceCount > 0;

  const handleContinue = () => {
    onClose();
    navigate('/book');
  };

  const handleClearAll = () => {
    clearAll();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Your stay summary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Your Stay Summary</h2>
          <div className={styles.headerActions}>
            {hasItems && (
              <button type="button" className={styles.clearAll} onClick={handleClearAll}>
                Clear All
              </button>
            )}
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <p className={styles.roomCount}>
          {roomCount} {roomCount === 1 ? 'Room' : 'Rooms'}
          {experienceCount > 0 &&
            ` · ${experienceCount} ${experienceCount === 1 ? 'Experience' : 'Experiences'}`}
        </p>

        <div className={styles.list}>
          {rooms.map((room) => (
            <div key={room.roomId} className={styles.roomCard}>
              <div className={styles.roomCardTop}>
                <span className={styles.roomLabel}>
                  <BedDouble size={14} />
                  ROOM
                </span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeRoom(room.roomId)}
                  aria-label={`Remove ${room.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className={styles.roomName}>{room.name}</h3>
              <p className={styles.datesNote}>Dates — add on confirm booking page</p>
              <p className={styles.guests}>
                {room.adults} {room.adults === 1 ? 'Adult' : 'Adults'}, {room.children}{' '}
                {room.children === 1 ? 'Child' : 'Children'}
              </p>

              <p className={styles.roomPrice}>${room.pricePerNight.toFixed(2)}</p>
            </div>
          ))}

          {experiences.map((exp) => (
            <div key={exp.experienceId} className={styles.roomCard}>
              <div className={styles.roomCardTop}>
                <span className={styles.roomLabel}>
                  <Sparkles size={14} />
                  EXPERIENCE
                </span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeExperience(exp.experienceId)}
                  aria-label={`Remove ${exp.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className={styles.roomName}>{exp.name}</h3>
              <p className={styles.datesNote}>One-time — not per night</p>
              <p className={styles.roomPrice}>${exp.price.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.grandTotalRow}>
            <span>Grand Total</span>
            <span className={styles.grandTotalValue}>${grandTotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            className={styles.continueBtn}
            onClick={handleContinue}
            disabled={!hasItems}
          >
            Continue &gt;
          </button>
        </div>
      </div>
    </div>
  );
}