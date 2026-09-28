import { X, Plus } from 'lucide-react';
import { useRoomsPage } from '@lib/queries/useRoomsPage';
import { useCart, useCartActions } from '@lib/cart/CartContext';
import styles from './RoomPicker.module.css';

export default function RoomPicker({ onClose }) {
  const { data, isLoading, isError } = useRoomsPage();
  const { isInCart } = useCart();
  const { addRoom } = useCartActions();

  const availableRooms = (data?.rooms || []).filter((room) => !isInCart(room.id));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Add a room"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Add a Room</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.list}>
          {isLoading && <p className={styles.note}>Loading rooms…</p>}
          {isError && (
            <p className={styles.note}>Couldn't load rooms right now — please try again.</p>
          )}
          {!isLoading && !isError && availableRooms.length === 0 && (
            <p className={styles.note}>Every room is already in your stay.</p>
          )}

          {availableRooms.map((room) => (
            <div key={room.id} className={styles.roomRow}>
              <div>
                <h3 className={styles.roomName}>{room.name}</h3>
                <p className={styles.roomPrice}>${room.pricePerNight} / night</p>
              </div>
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => addRoom(room)}
              >
                <Plus size={15} />
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}