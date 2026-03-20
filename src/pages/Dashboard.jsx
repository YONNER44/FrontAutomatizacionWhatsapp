import { useQuery } from '@tanstack/react-query'
import { getPricesSummary, getProviders } from '../api/client'
import StatCard from '../components/StatCard'
import { Users, Pill, FileSpreadsheet, Activity } from 'lucide-react'

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['summary'],
    queryFn: getPricesSummary,
  })
  const { data: providers, isLoading: loadingProviders } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  })

  const activeProviders = providers?.filter(p => p.is_active).length ?? 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Resumen del sistema de recolección de precios vía WhatsApp
        </p>
      </div>

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
            <p className="text-gray-400 text-sm">
              No hay proveedores registrados aún.
            </p>
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
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    p.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
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
