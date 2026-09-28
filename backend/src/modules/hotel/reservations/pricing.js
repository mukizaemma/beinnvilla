/**
 * Shared stay-pricing math for Grand Villa bookings.
 * The public site displays USD; the server overwrites client-supplied totals
 * so Stripe/MoMo cannot be charged a forged amount.
 */
const DEFAULT_SELF = 150
const DEFAULT_BREAKFAST = 200
const MONTHLY_NIGHTS = 28

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const diffMs = new Date(checkOut) - new Date(checkIn)
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export function nightlyRate(room, includeBreakfast) {
  const withBreakfast = Number(room?.priceWithBreakfast || DEFAULT_BREAKFAST)
  const selfCatering = Number(room?.pricePerNight || DEFAULT_SELF)
  if (includeBreakfast) return withBreakfast
  return selfCatering
}

export function calcStayTotal(rooms, nights, experiences = [], options = {}) {
  const includeBreakfast = Boolean(options.includeBreakfast)
  const nightsCount = Number(nights) || 0
  const experiencesTotal = experiences.reduce((sum, item) => sum + Number(item.price || 0), 0)
  const first = rooms[0]
  const monthly = Number(first?.monthlyRate || 0)

  if (nightsCount >= MONTHLY_NIGHTS && monthly > 0) {
    const months = Math.max(1, Math.round(nightsCount / 30))
    return monthly * months + experiencesTotal
  }

  const perNight = rooms.reduce((sum, room) => sum + nightlyRate(room, includeBreakfast), 0)
  const roomsTotal = nightsCount > 0 ? perNight * nightsCount : perNight
  return roomsTotal + experiencesTotal
}
