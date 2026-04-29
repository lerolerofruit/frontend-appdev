import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, size = 'md' }) {
  const sizes = { sm: '28rem', md: '32rem', lg: '44rem', xl: '56rem' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(13,31,26,0.6)', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: sizes[size], maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '20px', boxShadow: '0 24px 60px rgba(13,148,136,0.18), 0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e2f5f0' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #f0fdf9' }}>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-xl transition-colors hover:bg-slate-100">
            <X size={17} className="text-slate-400" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
