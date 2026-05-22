import { useCallback, useEffect, useRef, useState } from 'react'
import { updateDocApi } from '../services/docs.api'

/**
 * Debounced autosave hook for the Tiptap editor.
 *
 * @param {string} docId   - The document ID to save to
 * @param {number} delay   - Debounce delay in ms (default 1500ms)
 * @returns {{ status, triggerSave }}
 *   - status: 'idle' | 'saving' | 'saved' | 'error'
 *   - triggerSave: (payload: { title?, contentJSON? }) => void
 */
export function useAutosave(docId, delay = 1500) {
    const [status, setStatus] = useState('idle') // idle | saving | saved | error
    const timerRef = useRef(null)
    const pendingRef = useRef(null)
    const lastSavedRef = useRef(null)

    const flush = useCallback(async () => {
        if (!pendingRef.current || !docId) return
        
        // Deep compare check: skip save if nothing actually changed
        const payloadString = JSON.stringify(pendingRef.current)
        if (payloadString === lastSavedRef.current) {
            pendingRef.current = null
            setStatus('saved')
            return
        }

        const payload = pendingRef.current
        pendingRef.current = null
        setStatus('saving')
        try {
            await updateDocApi(docId, payload)
            lastSavedRef.current = JSON.stringify(payload)
            setStatus('saved')
        } catch {
            setStatus('error')
        }
    }, [docId])

    const triggerSave = useCallback(
        (payload) => {
            pendingRef.current = { ...pendingRef.current, ...payload }
            setStatus('saving')
            clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                flush()
            }, delay)
        },
        [delay, flush]
    )

    // Clear timer on unmount — flush immediately so no data is lost
    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current)
            // Immediate save on unmount if pending
            if (pendingRef.current && docId) {
                updateDocApi(docId, pendingRef.current).catch(() => {})
            }
        }
    }, [docId])

    // Reset status to idle after 3s of showing 'saved'
    useEffect(() => {
        if (status !== 'saved') return
        const t = setTimeout(() => setStatus('idle'), 3000)
        return () => clearTimeout(t)
    }, [status])

    return { status, triggerSave }
}
