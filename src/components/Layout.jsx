import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, TrendingUp, QrCode } from 'lucide-react'
import logo from '../assets/Gemini_Generated_Image_1cvtzv1cvtzv1cvt.png'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/providers', icon: Users, label: 'Proveedores' },
  { to: '/prices', icon: TrendingUp, label: 'Precios' },
  { to: '/whatsapp', icon: QrCode, label: 'WhatsApp QR' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <img src={logo} alt="Logo" className="w-20 h-20 object-contain -ml-3 -my-3" />
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">AutoMaticación</p>
            <p className="text-xs text-gray-500">WhatsApp Precios</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
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

        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">v1.0.0 — Distriptive</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
