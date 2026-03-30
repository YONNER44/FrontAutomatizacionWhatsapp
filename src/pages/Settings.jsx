import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfigStatus, saveGoogleConfig } from '../api/client'
import { CheckCircle, XCircle, Upload, ExternalLink, RefreshCw, Info } from 'lucide-react'

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

  // Rellenar el campo con el ID guardado cuando carga el estado
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
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Google Sheets</h1>
        <p className="text-gray-500 mt-1">Vincula el sistema con la hoja de cálculo donde se guardan los precios</p>
      </div>

      {/* Estado actual */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Estado actual</h2>
          <button
            onClick={() => refetch()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Verificar conexión"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400">Verificando...</p>
        ) : (
          <div className="space-y-3">
            {/* Credenciales */}
            <div className="flex items-center gap-3">
              {status?.has_credentials
                ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                : <XCircle size={18} className="text-red-400 shrink-0" />}
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {status?.has_credentials ? 'Permiso de acceso configurado' : 'Sin permiso de acceso'}
                </p>
                {status?.account_email && (
                  <p className="text-xs text-gray-400">{status.account_email}</p>
                )}
              </div>
            </div>

            {/* Sheet ID */}
            <div className="flex items-center gap-3">
              {status?.sheet_id
                ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                : <XCircle size={18} className="text-red-400 shrink-0" />}
              <p className="text-sm font-medium text-gray-800">
                {status?.sheet_id ? 'Hoja de cálculo vinculada' : 'Sin hoja de cálculo vinculada'}
              </p>
            </div>

            {/* Conexión */}
            <div className={`flex items-center gap-3 rounded-xl p-3 mt-2 ${
              status?.connected
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {status?.connected
                ? <CheckCircle size={18} className="text-green-600 shrink-0" />
                : <XCircle size={18} className="text-red-500 shrink-0" />}
              <div>
                <p className={`text-sm font-semibold ${status?.connected ? 'text-green-700' : 'text-red-700'}`}>
                  {status?.connected ? 'Conectado — el sistema puede leer y escribir en tu hoja' : 'Sin conexión con Google Sheets'}
                </p>
                {status?.error && (
                  <p className="text-xs text-red-500 mt-0.5">{status.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Actualizar configuración</h2>
        <p className="text-xs text-gray-400 mb-5">Solo necesitas hacer esto una vez. Después el sistema funciona solo.</p>

        {/* Sheet ID */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Paso 1 — Código de tu hoja de Google
          </label>
          <input
            type="text"
            value={sheetId}
            onChange={e => setSheetId(e.target.value)}
            placeholder="Pega aquí el código de tu hoja..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 space-y-1">
            <p className="font-medium flex items-center gap-1"><Info size={12} /> ¿Dónde encuentro ese código?</p>
            <p>Abre tu hoja de Google en el navegador. En la barra de direcciones verás algo así:</p>
            <p className="font-mono bg-white border border-gray-200 rounded px-2 py-1 break-all">
              docs.google.com/spreadsheets/d/<strong className="text-green-700">1BxiMVs0XRA5nF...upms</strong>/edit
            </p>
            <p>Copia la parte resaltada (entre <span className="font-mono">/d/</span> y <span className="font-mono">/edit</span>) y pégala arriba.</p>
          </div>
        </div>

        {/* Credenciales JSON */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Paso 2 — Archivo de permiso de Google
            {status?.has_credentials && (
              <span className="ml-2 text-xs text-green-600 font-normal">(ya tienes uno guardado — solo cambia si quieres actualizarlo)</span>
            )}
          </label>

          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            <Upload size={22} className={`mx-auto mb-2 ${file ? 'text-green-500' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-700">
              {file ? file.name : 'Haz clic para seleccionar el archivo'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {file ? 'Archivo listo para subir' : 'Es el archivo .json que descargaste de Google Cloud'}
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            className="hidden"
          />

          {/* Guía rápida */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 space-y-1">
            <p className="font-semibold">¿Cómo obtener ese archivo por primera vez?</p>
            <p className="text-blue-600">Tu proveedor técnico debe entregarte este archivo. Si lo vas a crear tú:</p>
            <ol className="list-decimal ml-4 space-y-0.5">
              <li>Entra a <span className="font-mono">console.cloud.google.com</span></li>
              <li>Crea un proyecto → Habilita la API de Google Sheets</li>
              <li>Ve a Credenciales → Crea una cuenta de servicio</li>
              <li>Descarga la clave en formato JSON</li>
              <li>Comparte tu hoja de Google con el correo de la cuenta de servicio</li>
            </ol>
            <a
              href="https://console.cloud.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline mt-1 w-fit"
            >
              <ExternalLink size={11} /> Abrir Google Cloud Console
            </a>
          </div>
        </div>

        {/* Resultado */}
        {saveResult && (
          <div className={`flex items-start gap-2 rounded-lg p-3 mb-4 text-sm ${
            saveResult.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {saveResult.success
              ? <CheckCircle size={16} className="mt-0.5 shrink-0" />
              : <XCircle size={16} className="mt-0.5 shrink-0" />}
            {saveResult.message}
          </div>
        )}

        <button
          onClick={() => saveMutation.mutate()}
          disabled={!canSave || saveMutation.isPending}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saveMutation.isPending ? 'Guardando y verificando conexión...' : 'Guardar y probar conexión'}
        </button>

        {!canSave && !saveMutation.isPending && (
          <p className="text-xs text-center text-gray-400 mt-2">
            {!sheetId.trim() ? 'Ingresa el código de tu hoja para continuar' : 'Sube el archivo de permiso para continuar'}
          </p>
        )}
      </div>
    </div>
  )
}
