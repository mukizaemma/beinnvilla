import { runMorningSweep } from './service.js'

let started = false

export function startHostingSchedule(payload) {
  if (started) return
  started = true
  const tick = () => {
    runMorningSweep(payload).catch((error) => {
      payload.logger?.error?.(error)
    })
  }
  setTimeout(tick, 20000)
  setInterval(tick, 15 * 60 * 1000)
}
