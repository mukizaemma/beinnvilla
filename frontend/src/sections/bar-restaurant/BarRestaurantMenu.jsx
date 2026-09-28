import { useMemo, useState } from 'react'
import { useInView } from '@hooks/useInView'
import Reveal from '@components/ui/Reveal'
import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage'
import { useMenuItems } from '@lib/queries/useMenuItems'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { BRAND } from '@features/hotel/brand'
import {
  MENU_CATEGORIES,
  buildMenuOrderMessage,
  dietaryLabel,
  formatMoney,
  splitIngredients,
  whatsappDigits,
} from '@features/hotel/menu'
import styles from './BarRestaurantMenu.module.css'

function hasDetails(item) {
  return Boolean(
    splitIngredients(item.ingredients).length ||
      item.allergens ||
      item.portion ||
      item.notes ||
      item.dietary?.length,
  )
}

export default function BarRestaurantMenu() {
  const [ref, inView] = useInView(0.12)
  const { data } = useBarRestaurantPage()
  const { data: items = [], isLoading } = useMenuItems()
  const { data: layout } = useSiteLayout()
  const { eyebrow, headline } = data.menu
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState('')
  const [cart, setCart] = useState({})
  const [guestName, setGuestName] = useState('')
  const [notes, setNotes] = useState('')
  const [trayOpen, setTrayOpen] = useState(false)

  const visible = useMemo(() => {
    const list = filter === 'All' ? items : items.filter((item) => item.category === filter)
    return [...list].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name))
  }, [items, filter])

  const categories = useMemo(() => {
    const used = new Set(items.map((item) => item.category))
    return ['All', ...MENU_CATEGORIES.filter((category) => used.has(category))]
  }, [items])

  const lines = items
    .filter((item) => cart[item.id] > 0)
    .map((item) => ({ ...item, qty: cart[item.id] }))
  const total = lines.reduce((sum, line) => sum + line.qty * line.price, 0)
  const count = lines.reduce((sum, line) => sum + line.qty, 0)
  const phone = whatsappDigits(layout?.company)

  function add(id) {
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }))
    setTrayOpen(true)
  }

  function setQty(id, qty) {
    setCart((current) => {
      const next = { ...current }
      if (qty <= 0) delete next[id]
      else next[id] = qty
      return next
    })
  }

  function sendOrder() {
    if (!lines.length || !phone) return
    const text = buildMenuOrderMessage({
      hotelName: layout?.company?.name || BRAND.name,
      lines,
      total,
      guestName: guestName.trim(),
      notes: notes.trim(),
    })
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className={styles.section} ref={ref} id="menu">
      <div className="container">
        <div className={`${styles.header} fade-in-up ${inView ? 'is-visible' : ''}`}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2 className={styles.headline}>{headline}</h2>
          <p className={styles.lead}>
            Add dishes to your order, then send it on WhatsApp. Hover or tap Details for ingredients
            and serving notes.
          </p>
        </div>

        {categories.length > 2 && (
          <div className={styles.filters}>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={filter === category ? styles.filterActive : styles.filter}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {isLoading && <p className={styles.empty}>Loading the menu…</p>}

        {!isLoading && visible.length === 0 && (
          <p className={styles.empty}>The kitchen is updating the menu. Please ask the front desk.</p>
        )}

        <div className={styles.grid}>
          {visible.map((item, index) => {
            const qty = cart[item.id] || 0
            const ingredients = splitIngredients(item.ingredients)
            const details = hasDetails(item)
            return (
              <Reveal
                as="article"
                key={item.id}
                className={styles.card}
                delay={Math.min(index, 8) * 70}
              >
                <div
                  className={styles.photo}
                  style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                >
                  <span className={styles.category}>{item.category}</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.name}>{item.name}</h3>
                    <span className={styles.price}>{formatMoney(item.price)}</span>
                  </div>
                  {item.description && <p className={styles.description}>{item.description}</p>}
                  {item.dietary?.length > 0 && (
                    <div className={styles.tags}>
                      {item.dietary.map((tag) => (
                        <span key={tag}>{dietaryLabel(tag)}</span>
                      ))}
                    </div>
                  )}
                  <div className={styles.actions}>
                    {details && (
                      <div className={`${styles.details} ${openId === item.id ? styles.detailsOpen : ''}`}>
                        <button
                          type="button"
                          className={styles.detailsBtn}
                          aria-expanded={openId === item.id}
                          onClick={() => setOpenId((current) => (current === item.id ? '' : item.id))}
                        >
                          Details
                        </button>
                        <div className={styles.popover} role="tooltip">
                          {item.portion && (
                            <p>
                              <strong>Portion</strong>
                              {item.portion}
                            </p>
                          )}
                          {ingredients.length > 0 && (
                            <p>
                              <strong>Ingredients</strong>
                              {ingredients.join(', ')}
                            </p>
                          )}
                          {item.allergens && (
                            <p>
                              <strong>Allergens</strong>
                              {item.allergens}
                            </p>
                          )}
                          {item.dietary?.length > 0 && (
                            <p>
                              <strong>Dietary</strong>
                              {item.dietary.map(dietaryLabel).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p>
                              <strong>Notes</strong>
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {qty === 0 ? (
                      <button type="button" className={styles.add} onClick={() => add(item.id)}>
                        Add
                      </button>
                    ) : (
                      <div className={styles.stepper}>
                        <button type="button" onClick={() => setQty(item.id, qty - 1)} aria-label="Fewer">
                          −
                        </button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => add(item.id)} aria-label="More">
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>

      {count > 0 && (
        <div className={`${styles.tray} ${trayOpen ? styles.trayOpen : ''}`}>
          <button type="button" className={styles.trayToggle} onClick={() => setTrayOpen((value) => !value)}>
            <span>
              Your order <strong>{count}</strong>
            </span>
            <strong>{formatMoney(total)}</strong>
            <em>{trayOpen ? 'Hide' : 'Review'}</em>
          </button>
          {trayOpen && (
            <div className={styles.trayBody}>
              <ul>
                {lines.map((line) => (
                  <li key={line.id}>
                    <div>
                      <strong>{line.name}</strong>
                      <small>
                        {line.qty} × {formatMoney(line.price)}
                      </small>
                    </div>
                    <span>{formatMoney(line.qty * line.price)}</span>
                    <div className={styles.stepper}>
                      <button type="button" onClick={() => setQty(line.id, line.qty - 1)} aria-label="Fewer">
                        −
                      </button>
                      <span>{line.qty}</span>
                      <button type="button" onClick={() => add(line.id)} aria-label="More">
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <label>
                Your name
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="So the restaurant can find you"
                />
              </label>
              <label>
                Notes or recommendations
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Spice level, no onions, allergies, table number…"
                />
              </label>
              <div className={styles.trayTotal}>
                <span>Total</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              {phone ? (
                <button type="button" className={styles.whatsapp} onClick={sendOrder}>
                  Order on WhatsApp
                </button>
              ) : (
                <p className={styles.empty}>WhatsApp is not set yet. Please ask the front desk to take the order.</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
