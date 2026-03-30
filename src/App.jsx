import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Providers from './pages/Providers'
import Prices from './pages/Prices'
import WhatsAppQR from './pages/WhatsAppQR'
import Settings from './pages/Settings'
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="providers" element={<Providers />} />
        <Route path="prices" element={<Prices />} />
        <Route path="whatsapp" element={<WhatsAppQR />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
