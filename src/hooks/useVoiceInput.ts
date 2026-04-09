'use client'
import { useState, useRef, useCallback } from 'react'

export type VoiceState = 'idle' | 'listening' | 'processing'

interface ISpeechRecognition {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}

export function useVoiceInput(
  onTranscript: (text: string) => void,
  onError?: (error: string) => void,
) {
  const [state, setState] = useState<VoiceState>('idle')
  const recRef = useRef<ISpeechRecognition | null>(null)
  const handlerRef = useRef(onTranscript)
  handlerRef.current = onTranscript
  const errorRef = useRef(onError)
  errorRef.current = onError

  const start = useCallback(() => {
    const SR =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    if (!SR) {
      errorRef.current?.('not-supported')
      return
    }

    if (recRef.current) { recRef.current.abort(); recRef.current = null }

    const rec: ISpeechRecognition = new SR()
    rec.lang = 'fr-FR'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onstart = () => setState('listening')
    rec.onresult = (e) => {
      setState('processing')
      handlerRef.current(e.results[0][0].transcript)
    }
    rec.onerror = (e: { error: string }) => {
      setState('idle')
      errorRef.current?.(e.error)
    }
    // Only reset to idle if we never got a result (user stopped without speaking)
    rec.onend = () => setState(prev => prev === 'listening' ? 'idle' : prev)

    recRef.current = rec
    rec.start()
  }, [])

  const stop = useCallback(() => {
    if (recRef.current) { recRef.current.abort(); recRef.current = null }
    setState('idle')
  }, [])

  const resetState = useCallback(() => setState('idle'), [])

  return { state, start, stop, resetState }
}
