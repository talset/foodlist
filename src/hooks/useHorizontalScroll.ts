'use client'

import { useRef, useEffect } from 'react'

/**
 * Returns a ref to attach to a horizontally-scrollable container.
 * Enables:
 *  - Mouse wheel (vertical) → horizontal scroll (only when strip overflows)
 *  - Click-drag → horizontal scroll (cursor changes to grabbing)
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      // Only intercept shift+wheel (desktop) for horizontal scrolling
      // Never intercept regular vertical scroll — let the page scroll
      if (!e.shiftKey) return
      if (el.scrollWidth <= el.clientWidth) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    let isDown = false
    let startX = 0
    let startScrollLeft = 0

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX
      startScrollLeft = el.scrollLeft
      el.style.cursor = 'grabbing'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      el.scrollLeft = startScrollLeft - (e.pageX - startX)
    }

    const onMouseUp = () => {
      if (!isDown) return
      isDown = false
      el.style.cursor = ''
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return ref
}
