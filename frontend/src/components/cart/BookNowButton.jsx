import { Calendar, Check } from 'lucide-react';
import { useCart, useCartActions } from '@lib/cart/CartContext';

/**
 * Drop-in replacement for the old `<Link to="/contact">Book Now</Link>`
 * buttons on HomeRooms, RoomsList, and RoomInfo. Pass the same
 * `className` those used, so styling carries over unchanged.
 */
export default function BookNowButton({ room, className, icon = true }) {
  const { isInCart } = useCart();
  const { addRoom } = useCartActions();
  const added = isInCart(room.id);

  return (
    <button
      type="button"
      className={className}
      onClick={() => !added && addRoom(room)}
      aria-pressed={added}
      disabled={added}
    >
      {icon && (added ? <Check size={15} /> : <Calendar size={15} />)}
      {added ? 'Added' : 'Book Now'}
    </button>
  );
}