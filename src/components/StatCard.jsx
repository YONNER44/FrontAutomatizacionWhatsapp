export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 flex items-start gap-3 md:gap-4 min-w-0">
      <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={18} className="md:hidden" />
        <Icon size={22} className="hidden md:block" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs md:text-sm text-gray-500 font-medium leading-tight">{title}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-900 mt-0.5 truncate">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1 leading-tight">{subtitle}</p>}
      </div>
    </div>
  )
}
