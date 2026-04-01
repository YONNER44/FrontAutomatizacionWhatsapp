import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, TrendingUp, QrCode, Settings, Menu, X } from 'lucide-react'
import logo from '../assets/Gemini_Generated_Image_1cvtzv1cvtzv1cvt.png'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/providers', icon: Users, label: 'Proveedores' },
  { to: '/prices', icon: TrendingUp, label: 'Precios' },
  { to: '/whatsapp', icon: QrCode, label: 'WhatsApp QR' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-20 h-20 object-contain -ml-3 -my-3" />
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">AutoMaticación</p>
              <p className="text-xs text-gray-500">WhatsApp Precios</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer firma */}
        <div className="px-5 py-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-[13px] font-bold tracking-tight text-indigo-700">neuro</span>
              <span className="text-[13px] font-bold tracking-tight text-violet-500">DIT</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono tracking-wide leading-tight">
              From[Data]to&#123;Disruption&#125;
            </p>
            <div className="mt-1.5 pt-1.5 border-t border-gray-100">
              <p className="text-[10px] font-semibold text-gray-600 leading-tight">Yonner Vargas Bernate</p>
              <p className="text-[10px] text-gray-400 leading-tight">Desarrollador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar móvil */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold text-gray-900 text-sm">AutoMaticación</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
