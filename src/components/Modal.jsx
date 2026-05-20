import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, size = 'md' }) {
  const sizes = { sm: '28rem', md: '32rem', lg: '44rem', xl: '56rem' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: sizes[size], maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 38px rgba(0,0,0,0.13), 0 4px 14px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-slate-100">
            <X size={18} className="text-slate-400" strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
