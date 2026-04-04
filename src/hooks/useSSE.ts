'use client'

import { useEffect } from 'react'

/**
 * Subscribe to household SSE events.
 * @param events  Array of event names to listen for
 * @param handler Called when any of the listed events fires
 */
export function useSSE(events: string[], handler: () => void) {
  useEffect(() => {
    const es = new EventSource('/api/events')

    for (const event of events) {
      es.addEventListener(event, handler)
    }

    es.onerror = () => {
      // Browser will auto-reconnect — nothing needed here
    }

    return () => {
      es.close()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
