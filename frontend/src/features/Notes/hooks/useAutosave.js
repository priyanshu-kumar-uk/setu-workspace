import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateDocApi } from '../services/docs.api'

export function useAutosave(docId, delay = 1500) {
    const queryClient = useQueryClient()
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
        const payload = { ...pendingRef.current }
        pendingRef.current = null
        setStatus('saving')
        try {
            await updateDocApi(docId, payload)
            lastSavedRef.current = JSON.stringify(payload)
            setStatus('saved')
            
            queryClient.setQueryData(['docs', docId], (old) => old ? { ...old, ...payload } : old)
            queryClient.setQueryData(['docs'], (old) => old ? old.map(d => d._id === docId ? { ...d, ...payload } : d) : old)
        } catch {
            setStatus('error')
        }
    }, [docId, queryClient])
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
