import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfigStatus, saveGoogleConfig } from '../api/client'
import { CheckCircle, XCircle, Upload, ExternalLink, RefreshCw, FileJson, Link2 } from 'lucide-react'

export default function Settings() {
  const queryClient = useQueryClient()
  const fileRef = useRef(null)

  const [sheetId, setSheetId] = useState('')
  const [file, setFile] = useState(null)
  const [saveResult, setSaveResult] = useState(null)

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['config-status'],
    queryFn: getConfigStatus,
  })

  useEffect(() => {
    if (status?.sheet_id && !sheetId) {
      setSheetId(status.sheet_id)
    }
  }, [status?.sheet_id])

  const saveMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('sheet_id', sheetId.trim())
      if (file) fd.append('credentials', file)
      return saveGoogleConfig(fd)
    },
    onSuccess: (data) => {
      setSaveResult(data)
      queryClient.invalidateQueries(['config-status'])
      setTimeout(() => setSaveResult(null), 8000)
    },
    onError: (err) => {
      setSaveResult({ success: false, message: err?.response?.data?.detail || 'Error al guardar' })
      setTimeout(() => setSaveResult(null), 8000)
    },
  })

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f) setFile(f)
  }

  const canSave = sheetId.trim() && (file || status?.has_credentials)

  return (
    <div className="p-4 md:p-8 max-w-2xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1 text-sm">Conecta el sistema con tu hoja de Google Sheets</p>
      </div>

      {/* Estado de conexión */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Estado de conexión</p>
          <button
            onClick={() => refetch()}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            title="Verificar"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {isLoading ? (
          <div className="px-5 py-4">
            <p className="text-sm text-gray-400">Verificando...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Credenciales */}
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                status?.has_credentials ? 'bg-green-100' : 'bg-red-50'
              }`}>
                {status?.has_credentials
                  ? <CheckCircle size={14} className="text-green-600" />
                  : <XCircle size={14} className="text-red-400" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {status?.has_credentials ? 'Archivo de permiso configurado' : 'Sin archivo de permiso'}
                </p>
                {status?.account_email && (
                  <p className="text-xs text-gray-400 truncate">{status.account_email}</p>
                )}
              </div>
            </div>

            {/* Sheet ID */}
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                status?.sheet_id ? 'bg-green-100' : 'bg-red-50'
              }`}>
                {status?.sheet_id
                  ? <CheckCircle size={14} className="text-green-600" />
                  : <XCircle size={14} className="text-red-400" />}
              </div>
              <p className="text-sm font-medium text-gray-800">
                {status?.sheet_id ? 'Hoja de cálculo vinculada' : 'Sin hoja vinculada'}
              </p>
            </div>

            {/* Conexión */}
            <div className={`flex items-center gap-3 px-5 py-4 ${
              status?.connected ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                status?.connected ? 'bg-green-200' : 'bg-red-100'
              }`}>
                {status?.connected
                  ? <CheckCircle size={14} className="text-green-700" />
                  : <XCircle size={14} className="text-red-500" />}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${status?.connected ? 'text-green-800' : 'text-red-700'}`}>
                  {status?.connected ? 'Conectado y funcionando' : 'Sin conexión con Google Sheets'}
                </p>
                {status?.error && (
                  <p className="text-xs text-red-500 mt-0.5 break-words">{status.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Actualizar configuración</p>
          <p className="text-xs text-gray-400 mt-0.5">Solo necesitas hacer esto una vez</p>
        </div>

        <div className="p-5 space-y-5">

          {/* Paso 1 — Sheet ID */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">1</span>
              <label className="text-sm font-medium text-gray-700">Código de tu hoja de Google</label>
            </div>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                placeholder="Pega aquí el código..."
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="mt-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
              <p className="text-xs text-gray-500 mb-1.5 font-medium">¿Dónde está ese código?</p>
              <p className="text-xs text-gray-400 font-mono bg-white border border-gray-100 rounded-lg px-2.5 py-2 break-all leading-relaxed">
                docs.google.com/spreadsheets/d/<strong className="text-green-600 not-italic">TU‑CÓDIGO‑AQUÍ</strong>/edit
              </p>
              <p className="text-xs text-gray-400 mt-1.5">Copia lo que está entre <span className="font-mono">/d/</span> y <span className="font-mono">/edit</span></p>
            </div>
          </div>

          {/* Paso 2 — JSON */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">2</span>
              <label className="text-sm font-medium text-gray-700">
                Archivo de permiso de Google
              </label>
              {status?.has_credentials && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">ya guardado</span>
              )}
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileJson size={16} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-green-500">Listo para subir</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={20} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">Haz clic para seleccionar</p>
                  <p className="text-xs text-gray-400 mt-0.5">Archivo .json de Google Cloud</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleFile} className="hidden" />

            {/* Guía */}
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2">¿Cómo obtener este archivo?</p>
              <ol className="space-y-1.5">
                {[
                  'Entra a console.cloud.google.com',
                  'Crea un proyecto → Habilita Google Sheets API',
                  'Ve a Credenciales → Crear cuenta de servicio',
                  'Descarga la clave en formato JSON',
                  'Comparte tu hoja con el correo de la cuenta',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-blue-600">
                    <span className="w-4 h-4 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <a
                href="https://console.cloud.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-3 font-medium"
              >
                <ExternalLink size={11} /> Abrir Google Cloud Console
              </a>
            </div>
          </div>

          {/* Resultado */}
          {saveResult && (
            <div className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
              saveResult.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {saveResult.success
                ? <CheckCircle size={15} className="mt-0.5 shrink-0" />
                : <XCircle size={15} className="mt-0.5 shrink-0" />}
              <span>{saveResult.message}</span>
            </div>
          )}

          {/* Botón */}
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!canSave || saveMutation.isPending}
            className="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveMutation.isPending ? 'Guardando y verificando...' : 'Guardar y probar conexión'}
          </button>

          {!canSave && !saveMutation.isPending && (
            <p className="text-xs text-center text-gray-400 -mt-2">
              {!sheetId.trim() ? 'Falta el código de tu hoja' : 'Falta el archivo de permiso'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
