const palettes = {
  teal:   { bg: 'linear-gradient(135deg,#ccfbf1,#99f6e4)', icon: '#0d9488', text: '#0f766e' },
  emerald:{ bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', icon: '#059669', text: '#047857' },
  cyan:   { bg: 'linear-gradient(135deg,#cffafe,#a5f3fc)', icon: '#0891b2', text: '#0e7490' },
  amber:  { bg: 'linear-gradient(135deg,#fef9c3,#fef08a)', icon: '#d97706', text: '#b45309' },
  rose:   { bg: 'linear-gradient(135deg,#ffe4e6,#fecdd3)', icon: '#e11d48', text: '#be123c' },
  violet: { bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', icon: '#7c3aed', text: '#6d28d9' },
  sky:    { bg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', icon: '#0284c7', text: '#0369a1' },
  indigo: { bg: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', icon: '#4f46e5', text: '#4338ca' },
};

export default function StatCard({ label, value, icon: Icon, color = 'teal', sub }) {
  const p = palettes[color] || palettes.teal;
  return (
    <div className="card-hover">
      <div className="flex items-center gap-4">
        <div style={{ background: p.bg }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Icon size={22} style={{ color: p.icon }} />
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>{value}</p>
          <p className="text-sm" style={{ color: '#64748b' }}>{label}</p>
          {sub && <p className="text-xs mt-0.5" style={{ color: p.text }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}
