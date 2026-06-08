import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {createDocApi, getAllDocsApi, getDocApi, updateDocApi, deleteDocApi,} from '../services/docs.api'
const DOCS_KEY = ['docs']
export function useAllDocs() {
    return useQuery({
        queryKey: DOCS_KEY,
        queryFn: async () => {
            const res = await getAllDocsApi()
            return res.data 
        },
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    })
}
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
export function useCreateDoc() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createDocApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DOCS_KEY })
        },
    })
}
export function useDeleteDoc() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => deleteDocApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DOCS_KEY })
        },
    })
}
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
