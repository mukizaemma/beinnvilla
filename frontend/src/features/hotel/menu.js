export const MENU_CATEGORIES = ['Starter', 'Main', 'Drink', 'Dessert', 'Breakfast']

export const MENU_DIETARY = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'contains-nuts', label: 'Contains nuts' },
  { value: 'halal', label: 'Halal' },
]

export function dietaryLabel(value) {
  return MENU_DIETARY.find((item) => item.value === value)?.label || value
}

export function formatMoney(amount) {
  const value = Number(amount) || 0
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`
}

export function whatsappDigits(company) {
  return String(company?.whatsapp || company?.phone || '').replace(/[^\d]/g, '')
}

export function splitIngredients(value) {
  return String(value || '')
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function buildMenuOrderMessage({ hotelName, lines, total, guestName, notes }) {
  const heading = `Hello ${hotelName || 'the restaurant'}, I would like to place an order:`
  const body = lines
    .map((line) => {
      const each = formatMoney(line.price)
      const lineTotal = formatMoney(line.qty * line.price)
      return line.qty > 1
        ? `• ${line.qty} × ${line.name} — ${each} each (${lineTotal})`
        : `• ${line.qty} × ${line.name} — ${lineTotal}`
    })
    .join('\n')

  const extras = [
    `Total: ${formatMoney(total)}`,
    guestName ? `Name: ${guestName}` : '',
    notes ? `Notes: ${notes}` : '',
  ].filter(Boolean)

  return [heading, '', body, '', extras.join('\n')].join('\n')
}
