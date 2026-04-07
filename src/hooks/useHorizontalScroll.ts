'use client'

import { useRef, useEffect } from 'react'

/**
 * Returns a ref to attach to a horizontally-scrollable container.
 * Enables click-drag → horizontal scroll (cursor changes to grabbing).
 * Does NOT intercept wheel/trackpad events — page scrolling is never blocked.
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let isDown = false
    let startX = 0
    let startScrollLeft = 0

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX
      startScrollLeft = el.scrollLeft
      el.style.cursor = 'grabbing'
      el.style.userSelect = 'none'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      el.scrollLeft = startScrollLeft - (e.pageX - startX)
    }

    const onMouseUp = () => {
      if (!isDown) return
      isDown = false
      el.style.cursor = ''
      el.style.userSelect = ''
    }

    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return ref
}
