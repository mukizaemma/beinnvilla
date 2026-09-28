const KEY = 'beinn-stay-draft'

export const emptyStayGuest = {
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  specialRequests: '',
}

export function emptyStayDraft() {
  return {
    checkIn: '',
    checkOut: '',
    guests: 2,
    children: 0,
    picked: [],
    guest: { ...emptyStayGuest },
    channel: '',
  }
}

export function readStayDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!parsed || typeof parsed !== 'object') return null
    return {
      ...emptyStayDraft(),
      ...parsed,
      guests: Number(parsed.guests) > 0 ? Number(parsed.guests) : 2,
      children: Number(parsed.children) > 0 ? Number(parsed.children) : 0,
      picked: Array.isArray(parsed.picked) ? parsed.picked.filter(Boolean) : [],
      guest: { ...emptyStayGuest, ...(parsed.guest || {}) },
      channel:
        parsed.channelChosen && (parsed.channel === 'email' || parsed.channel === 'whatsapp')
          ? parsed.channel
          : '',
    }
  } catch {
    return null
  }
}

export function writeStayDraft(draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    /* the stay still submits if storage is blocked */
  }
}

export function clearStayDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing stored to remove */
  }
}

export function draftFromSearch(params, saved) {
  const base = saved || emptyStayDraft()
  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')
  const guests = Number(params.get('guests'))
  const facility = params.get('facility')
  return {
    ...base,
    checkIn: checkIn || base.checkIn,
    checkOut: checkOut || base.checkOut,
    guests: guests > 0 ? guests : base.guests,
    picked: facility && !base.picked.includes(facility) ? [...base.picked, facility] : base.picked,
  }
}
