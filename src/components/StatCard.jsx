const palettes = {
  teal:   { bg: '#f0fdfa', icon: '#0f766e', text: '#0f766e' },
  emerald:{ bg: '#f0fdf4', icon: '#15803d', text: '#15803d' },
  cyan:   { bg: '#f0f9fc', icon: '#0c4a6e', text: '#0c4a6e' },
  amber:  { bg: '#fffbeb', icon: '#92400e', text: '#92400e' },
  rose:   { bg: '#fff1f2', icon: '#be123c', text: '#be123c' },
  violet: { bg: '#f5f3ff', icon: '#6d28d9', text: '#6d28d9' },
  sky:    { bg: '#f0f9fc', icon: '#0c4a6e', text: '#0c4a6e' },
  indigo: { bg: '#eef2ff', icon: '#3730a3', text: '#3730a3' },
};

export default function StatCard({ label, value, icon: Icon, color = 'teal', sub }) {
  const p = palettes[color] || palettes.teal;
  return (
    <div className="card-hover">
      <div className="flex items-start gap-4">
        <div style={{ background: p.bg }}
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon size={20} style={{ color: p.icon }} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-600 mt-0.5">{label}</p>
          {sub && <p className="text-xs mt-1 text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
