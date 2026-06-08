import { useCallback, useEffect, useRef, useState } from 'react'
import { updateDocApi } from '../services/docs.api'
export function useAutosave(docId, delay = 1500) {
    const [status, setStatus] = useState('idle') 
    const timerRef = useRef(null)
    const pendingRef = useRef(null)
    const lastSavedRef = useRef(null)
    const flush = useCallback(async () => {
        if (!pendingRef.current || !docId) return
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
    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current)
            if (pendingRef.current && docId) {
                updateDocApi(docId, pendingRef.current).catch(() => {})
            }
        }
    }, [docId])
    useEffect(() => {
        if (status !== 'saved') return
        const t = setTimeout(() => setStatus('idle'), 3000)
        return () => clearTimeout(t)
    }, [status])
    return { status, triggerSave }
}
