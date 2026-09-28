/**
 * rooms: cart rooms [{ pricePerNight, priceWithBreakfast, monthlyRate, ... }]
 * nights: number of nights (0 if dates aren't set yet)
 * experiences: cart experiences [{ price, ... }] — flat, one-time, not multiplied by nights
 */
const DEFAULT_SELF = 150
const DEFAULT_BREAKFAST = 200
const MONTHLY_NIGHTS = 28

export function nightlyRate(room, includeBreakfast) {
  const withBreakfast = Number(room?.priceWithBreakfast || DEFAULT_BREAKFAST)
  const selfCatering = Number(room?.pricePerNight || DEFAULT_SELF)
  if (includeBreakfast) return withBreakfast
  return selfCatering
}

export function calcEstimatedTotal(rooms, nights, experiences = [], options = {}) {
  const includeBreakfast = Boolean(options.includeBreakfast)
  const nightsCount = Number(nights) || 0
  const experiencesSubtotal = experiences.reduce((sum, e) => sum + Number(e.price || 0), 0)
  const first = rooms[0]
  const monthly = Number(first?.monthlyRate || 0)

  if (nightsCount >= MONTHLY_NIGHTS && monthly > 0) {
    const months = Math.max(1, Math.round(nightsCount / 30))
    return monthly * months + experiencesSubtotal
  }

  const roomsPerNightSubtotal = rooms.reduce((sum, r) => sum + nightlyRate(r, includeBreakfast), 0)
  const roomsTotal = nightsCount > 0 ? roomsPerNightSubtotal * nightsCount : roomsPerNightSubtotal
  return roomsTotal + experiencesSubtotal
}
