import { useRef, useState, useCallback } from 'react'

function isOnScreen(node, threshold) {
  const rect = node.getBoundingClientRect()
  if (rect.height <= 0) return false
  const viewHeight = window.innerHeight || document.documentElement.clientHeight || 0
  const visible = Math.min(rect.bottom, viewHeight) - Math.max(rect.top, 0)
  return visible / rect.height >= threshold
}

/**
 * Returns a [ref, inView] tuple.
 * inView becomes true once the element enters the viewport
 * and stays true (fires only once — ideal for entrance animations).
 */
export function useInView(thresholdOrOptions = 0.3) {
  const threshold =
    typeof thresholdOrOptions === 'number'
      ? thresholdOrOptions
      : thresholdOrOptions?.threshold ?? 0.3

  const [inView, setInView] = useState(false)
  const cleanupRef = useRef(null)

  const ref = useCallback(
    (node) => {
      cleanupRef.current?.()
      cleanupRef.current = null
      if (!node) return

      let stopped = false
      const finish = () => {
        if (stopped) return
        stopped = true
        setInView(true)
        cleanup()
      }
      const check = () => {
        if (!stopped && isOnScreen(node, threshold)) finish()
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) finish()
        },
        { threshold },
      )
      const cleanup = () => {
        observer.disconnect()
        window.removeEventListener('scroll', check, true)
        window.removeEventListener('resize', check)
      }

      observer.observe(node)
      window.addEventListener('scroll', check, true)
      window.addEventListener('resize', check)
      requestAnimationFrame(check)
      const later = window.setTimeout(check, 80)
      cleanupRef.current = () => {
        window.clearTimeout(later)
        cleanup()
      }
    },
    [threshold],
  )

  return [ref, inView]
}
