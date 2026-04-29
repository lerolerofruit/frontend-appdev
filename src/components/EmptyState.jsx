export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div style={{ background: 'linear-gradient(135deg,#ccfbf1,#99f6e4)' }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={24} style={{ color: '#0d9488' }} />
      </div>
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}
