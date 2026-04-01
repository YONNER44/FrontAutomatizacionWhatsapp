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
  const [status, setStatus] = useState(null)
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
      setError(true)
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
    <div className="p-4 md:p-8 max-w-xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Vincular WhatsApp</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Escanea el código QR desde tu celular para activar el sistema
        </p>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        {/* Estado */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${
          error
            ? 'bg-red-50 border-red-100'
            : isConnected
              ? 'bg-green-50 border-green-100'
              : 'bg-amber-50 border-amber-100'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            error ? 'bg-red-100' : isConnected ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            {error
              ? <WifiOff size={16} className="text-red-500" />
              : isConnected
                ? <Wifi size={16} className="text-green-600" />
                : <RefreshCw size={16} className="text-amber-500 animate-spin" />
            }
          </div>
          <div>
            <p className={`text-sm font-semibold ${
              error ? 'text-red-700' : isConnected ? 'text-green-700' : 'text-amber-700'
            }`}>
              {error
                ? 'Servicio WhatsApp no disponible'
                : isConnected
                  ? 'WhatsApp conectado'
                  : 'Esperando escaneo...'}
            </p>
            <p className={`text-xs ${
              error ? 'text-red-500' : isConnected ? 'text-green-600' : 'text-amber-600'
            }`}>
              {error
                ? 'El servicio no está corriendo en el puerto 3000'
                : isConnected
                  ? 'El sistema está recibiendo mensajes activamente'
                  : 'Abre WhatsApp y escanea el código de abajo'}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 md:p-8 flex flex-col items-center">
          {error ? (
            <div className="text-center w-full py-4">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <WifiOff size={28} className="text-red-300" />
              </div>
              <p className="text-gray-700 font-semibold mb-1">Servicio no disponible</p>
              <p className="text-gray-400 text-sm">
                El sistema de WhatsApp no está activo en este momento.
                <br />Contacta al administrador para activarlo.
              </p>
              <p className="text-gray-300 text-xs mt-4">
                Reintentando en {POLL_INTERVAL / 1000}s...
              </p>
            </div>
          ) : isConnected ? (
            <div className="text-center py-4">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone size={40} className="text-green-600" />
              </div>
              <p className="text-gray-900 font-bold text-lg">Dispositivo vinculado</p>
              <p className="text-gray-500 text-sm mt-1">
                WhatsApp está activo y recibiendo mensajes
              </p>
            </div>
          ) : qr ? (
            <div className="text-center w-full">
              <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm mb-5">
                <QRCode value={qr} size={200} />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-gray-700">Cómo escanear:</p>
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                  Abre WhatsApp en tu celular
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                  Ve a <strong className="text-gray-700 mx-1">Dispositivos vinculados</strong>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                  Toca <strong className="text-gray-700 mx-1">Vincular dispositivo</strong> y escanea
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <RefreshCw size={32} className="text-gray-300 mx-auto mb-3 animate-spin" />
              <p className="text-gray-400 text-sm">Generando código QR...</p>
            </div>
          )}
        </div>
      </div>

      {lastUpdate && (
        <p className="text-center text-xs text-gray-400 mt-3">
          Actualizado a las {lastUpdate.toLocaleTimeString()} · refresca cada {POLL_INTERVAL / 1000}s
        </p>
      )}
    </div>
  )
}
