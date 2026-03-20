import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// --- Proveedores ---
export const getProviders = () => api.get('/providers').then(r => r.data)
export const createProvider = (data) => api.post('/providers', data).then(r => r.data)
export const updateProvider = (id, data) => api.put(`/providers/${id}`, data).then(r => r.data)
export const deleteProvider = (id) => api.delete(`/providers/${id}`)

// --- Precios ---
export const getPrices = (params = {}) => api.get('/prices', { params }).then(r => r.data)
export const getPricesSummary = () => api.get('/prices/summary').then(r => r.data)
export const deletePrice = (id) => api.delete(`/prices/${id}`)
export const getExcelDownloadUrl = () => '/api/prices/export/excel'
