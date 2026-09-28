export const quarter = { width: '25%' }
export const half = { width: '50%' }
export const threeQuarter = { width: '75%' }
export const full = { width: '100%' }

export function withWidth(field, width) {
  return {
    ...field,
    admin: { ...(field.admin || {}), width },
  }
}
