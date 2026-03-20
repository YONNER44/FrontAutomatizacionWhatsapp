import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react'

const POLL_INTERVAL = 3000

async function fetchStatus() {
  const res = await fetch('/wa/status')
  if (!res.ok) throw new Error('Servicio no disponible')
  return res.json()
}

export default function WhatsAppQR() {
  const [status, setStatus] = useState(null) // 'connected' | 'disconnected'
  const [qr, setQr] = useState(null)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const poll = async () => {
    try {
      const data = await fetchStatus()
      setStatus(data.status)
      setQr(data.qrCode || null)
      setLastUpdate(new Date())
      setError(null)
    } catch {
      setError('No se puede conectar al servicio WhatsApp (puerto 3000). ¿Está corriendo?')
      setStatus(null)
    }
  }

  useEffect(() => {
    poll()
    const interval = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const isConnected = status === 'connected'

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vincular WhatsApp</h1>
        <p className="text-gray-500 mt-1">
          Escanea el código QR desde tu celular para conectar el dispositivo
        </p>
      </div>

      {/* Estado de conexión */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium ${
        error
          ? 'bg-red-50 text-red-700'
          : isConnected
            ? 'bg-green-50 text-green-700'
            : 'bg-yellow-50 text-yellow-700'
      }`}>
        {error ? (
          <WifiOff size={18} />
        ) : isConnected ? (
          <Wifi size={18} />
        ) : (
          <RefreshCw size={18} className="animate-spin" />
        )}
        <span>
          {error
            ? error
            : isConnected
              ? 'WhatsApp conectado correctamente'
              : 'Esperando escaneo del código QR...'}
        </span>
      </div>

      {/* QR o estado conectado */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center">
        {error ? (
          <div className="text-center py-8">
            <WifiOff size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Inicia el servicio con:</p>
            <code className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg mt-2 inline-block">
              npm start
            </code>
            <p className="text-gray-400 text-xs mt-1">en la carpeta WhatsAppService/</p>
          </div>
        ) : isConnected ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone size={36} className="text-green-600" />
            </div>
            <p className="text-gray-900 font-semibold text-lg">Dispositivo vinculado</p>
            <p className="text-gray-500 text-sm mt-1">
              El servicio está recibiendo mensajes activamente
            </p>
          </div>
        ) : qr ? (
          <>
            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <QRCode value={qr} size={220} />
            </div>
            <p className="text-gray-500 text-sm mt-5 text-center">
              Abre WhatsApp en tu celular →{' '}
              <span className="font-medium text-gray-700">Dispositivos vinculados</span>{' '}
              → Vincular dispositivo
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <RefreshCw size={36} className="text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400 text-sm">Generando código QR...</p>
          </div>
        )}
      </div>

      {/* Última actualización */}
      {lastUpdate && (
        <p className="text-center text-xs text-gray-400 mt-4">
          Actualizado {lastUpdate.toLocaleTimeString()} · se refresca cada {POLL_INTERVAL / 1000}s
        </p>
      )}
    </div>
  )
}
