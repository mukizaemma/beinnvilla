import { Sparkles, Wifi, Coffee, BedDouble, Bath, UtensilsCrossed, Wine, Snowflake, Droplets, Ship } from 'lucide-react'
import { useRoomsPage } from '@lib/queries/useRoomsPage'
import Reveal from '@components/ui/Reveal'
import styles from './RoomsHighlights.module.css'

const ICONS = {
  sparkles: Sparkles,
  wifi: Wifi,
  coffee: Coffee,
  breakfast: Coffee,
  bed: BedDouble,
  bath: Bath,
  kitchen: UtensilsCrossed,
  bar: Wine,
  ac: Snowflake,
  'hot-water': Droplets,
  boat: Ship,
}

export default function RoomsHighlights() {
  const { data } = useRoomsPage()
  const highlights = data.highlights || []
  if (!highlights.length) return null

  return (
    <section className={styles.section}>
      <div className={`container ${styles.row}`}>
        {highlights.map((item, index) => {
          const Icon = ICONS[item.icon] || Sparkles
          return (
            <Reveal key={item.id || item.label} className={styles.item} delay={index * 80}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
