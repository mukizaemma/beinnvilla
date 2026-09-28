import { Link } from 'react-router-dom';
import {
  Ruler,
  BedDouble,
  Users,
  Mountain,
  Tv,
  Wifi,
  Snowflake,
  Lock,
  AlarmClock,
  Phone,
  Bath,
  Sofa,
  Refrigerator,
  MapPin,
  Clock,
} from 'lucide-react';
import { FEATURE_LIBRARY } from '@features/hotel/rooms/featureLibrary';
import { useSiteLayout } from '@lib/queries/useSiteLayout';
import RichText from '@components/ui/RichText';
import { useCart } from '@lib/cart/CartContext';
import BookNowButton from '@components/cart/BookNowButton';
import styles from './RoomInfo.module.css';

const SPEC_ICONS = [
  { key: 'size', Icon: Ruler },
  { key: 'bed', Icon: BedDouble },
  { key: 'occupancy', Icon: Users },
  { key: 'view', Icon: Mountain },
];

const FEATURE_ICONS = {
  tv: Tv,
  wifi: Wifi,
  ac: Snowflake,
  safe: Lock,
  alarm: AlarmClock,
  phone: Phone,
  bath: Bath,
  sofa: Sofa,
  fridge: Refrigerator,
};

export default function RoomInfo({ room }) {
  const { data: layout } = useSiteLayout();
  const { company } = layout;
  const { isInCart } = useCart();
  const added = isInCart(room.id);

  return (
    <div className={styles.wrap}>
      <div className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/rooms">Rooms</Link>
          <span>/</span>
          <span aria-current="page">{room.name}</span>
        </nav>

        <h1 className={styles.name}>{room.name}</h1>
        <p className={styles.price}>
          From <span className={styles.priceValue}>${room.pricePerNight}</span> / night
        </p>

        <ul className={styles.specRow}>
          {SPEC_ICONS.map(({ key, Icon }) => (
            <li key={key}>
              <Icon size={16} />
              <span>{room.specs[key]}</span>
            </li>
          ))}
        </ul>

        <h2 className={styles.sectionTitle}>Overview</h2>
        <RichText className={styles.description} value={room.descriptionHtml || room.description} />

        <h2 className={styles.sectionTitle}>Room Features</h2>
        <ul className={styles.features}>
          {room.features.map((id) => {
            const Icon = FEATURE_ICONS[id];
            return (
              <li key={id} className={styles.featureItem}>
                <Icon size={16} className={styles.featureIcon} />
                <span>{FEATURE_LIBRARY[id]}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className={styles.sidebar}>
        <div className={styles.bookCard}>
          <h3 className={styles.bookCardTitle}>Book This Room</h3>
          <p className={styles.bookCardPrice}>
            ${room.pricePerNight}
            <span>/ night</span>
          </p>
          <BookNowButton room={room} className={styles.bookBtn} />
          <p className={styles.bookCardNote}>
            {added
              ? 'Added to your stay — set your dates on the next step, no payment needed yet.'
              : "We'll hold this in your stay cart — no payment needed to add it."}
          </p>
        </div>

        <div className={styles.locationCard}>
          <h4 className={styles.locationTitle}>Getting Here</h4>
          <div className={styles.locationRow}>
            <MapPin size={15} />
            <span>{company.address}</span>
          </div>
          <div className={styles.locationRow}>
            <Clock size={15} />
            <span>{company.distanceFromKigali}</span>
          </div>
          <a
            href={company.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.directionsLink}
          >
            Get Directions
          </a>
        </div>
      </aside>
    </div>
  );
}