import api from '../../axiosInstance'

export async function createDocApi() {
    const res = await api.post('/docs')
    return res.data
}

export async function getAllDocsApi() {
    const res = await api.get('/docs')
    return res.data
}

export async function getDocApi(id) {
    const res = await api.get(`/docs/${id}`)
    return res.data
}

export async function updateDocApi(id, { title, contentJSON }) {
    const res = await api.patch(`/docs/${id}`, { title, contentJSON })
    return res.data
}

export async function deleteDocApi(id) {
    const res = await api.delete(`/docs/${id}`)
    return res.data
}

// ─── Future: Image Upload (placeholder — not yet implemented) ─────────────────
// export async function uploadImageApi(file) {
//     const formData = new FormData()
//     formData.append('image', file)
//     const res = await api.post('/docs/upload-image', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//     })
//     return res.data // { url: '/uploads/...' }
// }
