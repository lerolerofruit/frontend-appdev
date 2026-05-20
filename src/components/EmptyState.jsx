export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-5 bg-slate-100">
        <Icon size={28} className="text-slate-400" strokeWidth={1.5} />
      </div>
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-2 max-w-sm">{description}</p>}
    </div>
  );
}
