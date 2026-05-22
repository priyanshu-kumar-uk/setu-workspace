import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {createDocApi, getAllDocsApi, getDocApi, updateDocApi, deleteDocApi,} from '../services/docs.api'

const DOCS_KEY = ['docs']

// Fetch all documents for dashboard
export function useAllDocs() {
    return useQuery({
        queryKey: DOCS_KEY,
        queryFn: async () => {
            const res = await getAllDocsApi()
            return res.data //api res
        },
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    })
}

// Fetch a single document 
export function useDoc(id) {
    return useQuery({
        queryKey: ['docs', id],
        queryFn: async () => {
            const res = await getDocApi(id)
            return res.data 
        },
        enabled: !!id,
        staleTime: 0,
        refetchOnWindowFocus: false,
    })
}

// Create a new document
export function useCreateDoc() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createDocApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DOCS_KEY })
        },
    })
}

// Delete a document
export function useDeleteDoc() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => deleteDocApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DOCS_KEY })
        },
    })
}

// Update document (used internally by autosave)
export function useUpdateDoc() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }) => updateDocApi(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['docs', id] })
            queryClient.invalidateQueries({ queryKey: DOCS_KEY })
        },
    })
}
