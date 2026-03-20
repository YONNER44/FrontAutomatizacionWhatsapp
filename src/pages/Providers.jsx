import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProviders, createProvider, updateProvider, deleteProvider } from '../api/client'
import Modal from '../components/Modal'
import { Plus, Pencil, Trash2, Phone, User } from 'lucide-react'
import toast from 'react-hot-toast'

function ProviderForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? { name: initial.name || '', phone_number: initial.phone_number || '' }
      : { name: '', phone_number: '' }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = { ...form, name: form.name.trim(), phone_number: form.phone_number.trim() }
    if (!trimmed.name || !trimmed.phone_number) {
      toast.error('Completa todos los campos')
      return
    }
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proveedor</label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: Farmacéutica Central"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Número de WhatsApp</label>
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: 573001234567"
            value={form.phone_number}
            onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Formato internacional sin + (Ej: 573001234567)</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default function Providers() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  })

  const createMut = useMutation({
    mutationFn: createProvider,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['providers'] })
      toast.success('Proveedor creado')
      setModalOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Error al crear'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, is_active, data }) => updateProvider(id, {
      name: data.name,
      phone_number: data.phone_number,
      is_active: is_active,
    }),
    onSuccess: (updatedProvider) => {
      qc.setQueryData(['providers'], (old) =>
        old?.map(p => p.id === updatedProvider.id ? updatedProvider : p) ?? []
      )
      toast.success('Proveedor actualizado')
      setEditing(null)
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Error al actualizar'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteProvider,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['providers'] })
      toast.success('Proveedor eliminado')
    },
    onError: () => toast.error('Error al eliminar'),
  })

  const handleDelete = (provider) => {
    if (confirm(`¿Eliminar a ${provider.name}?`)) {
      deleteMut.mutate(provider.id)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500 mt-1">Gestiona los proveedores que envían precios por WhatsApp</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Agregar proveedor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando proveedores...</div>
        ) : providers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No hay proveedores registrados.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="text-green-600 text-sm font-medium hover:underline mt-2 inline-block"
            >
              Agregar el primero →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Número WhatsApp</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {providers.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono">{p.phone_number}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo proveedor">
        <ProviderForm
          onSubmit={(data) => createMut.mutate(data)}
          onCancel={() => setModalOpen(false)}
          loading={createMut.isPending}
        />
      </Modal>

      {/* Modal editar */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar proveedor">
        {editing && (
          <ProviderForm
            key={editing.id}
            initial={editing}
            onSubmit={(data) => updateMut.mutate({ id: editing.id, is_active: editing.is_active, data })}
            onCancel={() => setEditing(null)}
            loading={updateMut.isPending}
          />
        )}
      </Modal>
    </div>
  )
}
