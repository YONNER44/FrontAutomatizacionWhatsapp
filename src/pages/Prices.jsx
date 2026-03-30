import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPrices, getProviders, getExcelDownloadUrl, deletePrice } from '../api/client'
import { Download, Search, FilterX, Trash2 } from 'lucide-react'

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-80 mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-center text-gray-900 font-semibold text-base mb-1">
          Eliminar precio
        </h3>
        <p className="text-center text-gray-500 text-sm mb-6">
          ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Prices() {
  const [filters, setFilters] = useState({ medication: '', provider_id: '' })
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const queryClient = useQueryClient()

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  })

  const { data: prices = [], isLoading } = useQuery({
    queryKey: ['prices', filters],
    queryFn: () => getPrices({
      ...(filters.medication && { medication: filters.medication }),
      ...(filters.provider_id && { provider_id: filters.provider_id }),
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDeletingId(null)
    },
  })

  const handleDelete = (id) => {
    setConfirmId(id)
  }

  const confirmDelete = () => {
    setDeletingId(confirmId)
    deleteMutation.mutate(confirmId)
    setConfirmId(null)
  }

  // Calcular IDs con el precio más bajo por medicamento (solo cuando hay 2+ proveedores)
  const bestPriceIds = useMemo(() => {
    const groups = {}
    prices.forEach(p => {
      const key = p.medication_name.toLowerCase()
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    const ids = new Set()
    Object.values(groups).forEach(group => {
      if (group.length < 2) return
      const min = Math.min(...group.map(p => p.price))
      group.filter(p => p.price === min).forEach(p => ids.add(p.id))
    })
    return ids
  }, [prices])

  const clearFilters = () => setFilters({ medication: '', provider_id: '' })
  const hasFilters = filters.medication || filters.provider_id

  return (
    <div className="p-8">
      {confirmId !== null && (
        <ConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Precios</h1>
          <p className="text-gray-500 mt-1">
            Precios de medicamentos reportados por proveedores
          </p>
        </div>
        <a
          href={getExcelDownloadUrl()}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Download size={16} />
          Descargar Excel
        </a>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Buscar medicamento..."
            value={filters.medication}
            onChange={e => setFilters(f => ({ ...f, medication: e.target.value }))}
          />
        </div>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-48"
          value={filters.provider_id}
          onChange={e => setFilters(f => ({ ...f, provider_id: e.target.value }))}
        >
          <option value="">Todos los proveedores</option>
          {providers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FilterX size={15} />
            Limpiar
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {isLoading ? 'Cargando...' : `${prices.length} registros`}
        </span>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando precios...</div>
        ) : prices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">
              {hasFilters
                ? 'No se encontraron precios con los filtros aplicados.'
                : 'Aún no hay precios registrados. Los precios aparecerán aquí cuando los proveedores envíen mensajes por WhatsApp.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Medicamento</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unidad</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Proveedor</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices.map(price => {
                  const isBest = bestPriceIds.has(price.id)
                  return (
                  <tr key={price.id} className={`transition-colors ${isBest ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}`}>
                    <td className={`px-6 py-3.5 font-medium ${isBest ? 'text-green-800' : 'text-gray-900'}`}>{price.medication_name}</td>
                    <td className="px-6 py-3.5 text-gray-500">{price.unit || '—'}</td>
                    <td className={`px-6 py-3.5 text-right font-mono font-semibold ${isBest ? 'text-green-700' : 'text-gray-900'}`}>
                      ${price.price.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {price.provider_name || `#${price.provider_id}`}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 text-xs">
                      {new Date(price.date_reported + 'T00:00:00').toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(price.id)}
                        disabled={deletingId === price.id}
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
