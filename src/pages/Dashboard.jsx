import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getPricesSummary, getProviders, initMonthlySheet, initDaySheet } from '../api/client'
import StatCard from '../components/StatCard'
import { Users, Pill, FileSpreadsheet, Activity, CalendarPlus, CalendarDays } from 'lucide-react'

export default function Dashboard() {
  const [initResult, setInitResult] = useState(null)

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['summary'],
    queryFn: getPricesSummary,
  })
  const { data: providers, isLoading: loadingProviders } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  })

  const initMonthMutation = useMutation({
    mutationFn: (force = false) => initMonthlySheet(force),
    onSuccess: (data) => {
      setInitResult(data)
      setTimeout(() => setInitResult(null), 7000)
    },
    onError: (err) => {
      setInitResult({ error: err?.response?.data?.detail || 'Error al inicializar la hoja' })
      setTimeout(() => setInitResult(null), 7000)
    },
  })

  const initDayMutation = useMutation({
    mutationFn: () => initDaySheet(),
    onSuccess: (data) => {
      setInitResult(data)
      setTimeout(() => setInitResult(null), 7000)
    },
    onError: (err) => {
      setInitResult({ error: err?.response?.data?.detail || 'Error al inicializar el día' })
      setTimeout(() => setInitResult(null), 7000)
    },
  })

  const activeProviders = providers?.filter(p => p.is_active).length ?? 0
  const currentMonth = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Resumen del sistema de recolección de precios vía WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => initDayMutation.mutate()}
            disabled={initDayMutation.isPending}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CalendarDays size={16} />
            {initDayMutation.isPending ? 'Creando...' : 'Inicializar día'}
          </button>
          <button
            onClick={() => initMonthMutation.mutate(false)}
            disabled={initMonthMutation.isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={`Crear hoja de ${currentMonth} en Google Sheets`}
          >
            <CalendarPlus size={16} />
            {initMonthMutation.isPending ? 'Creando hoja...' : `Inicializar ${currentMonth}`}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {initResult && (
        <div className={`flex items-start gap-3 rounded-xl p-4 mb-6 text-sm border ${
          initResult.error
            ? 'bg-red-50 border-red-200 text-red-800'
            : initResult.created
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <CalendarDays size={18} className="mt-0.5 shrink-0" />
          <span>{initResult.error || initResult.message}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Proveedores activos"
          value={loadingProviders ? '...' : activeProviders}
          subtitle={`${providers?.length ?? 0} registrados en total`}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Medicamentos"
          value={loadingSummary ? '...' : summary?.total_medications}
          subtitle="Únicos en el sistema"
          icon={Pill}
          color="blue"
        />
        <StatCard
          title="Registros de precios"
          value={loadingSummary ? '...' : summary?.total_prices}
          subtitle="Total acumulado"
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="Excel generado"
          value={summary?.excel?.exists ? 'Disponible' : 'Sin datos'}
          subtitle={
            summary?.excel?.exists
              ? `${summary.excel.providers?.length ?? 0} proveedores`
              : 'Esperando mensajes'
          }
          icon={FileSpreadsheet}
          color="orange"
        />
      </div>

      {/* Proveedores registrados */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Proveedores registrados</h2>
        {loadingProviders ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : providers?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No hay proveedores registrados aún.</p>
            <a href="/providers" className="text-green-600 text-sm font-medium hover:underline mt-1 inline-block">
              Agregar proveedor →
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {providers.map(p => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.phone_number}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {p.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
