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
export const initMonthlySheet = (force = false) => api.post(`/prices/init-month?force=${force}`).then(r => r.data)
export const initDaySheet = () => api.post('/prices/init-day').then(r => r.data)

// --- Configuración Google Sheets ---
export const getConfigStatus = () => api.get('/config/status').then(r => r.data)
export const saveGoogleConfig = (formData) =>
  api.post('/config/google', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
