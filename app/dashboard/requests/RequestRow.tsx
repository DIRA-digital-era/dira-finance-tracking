'use client';
import { resolveRequestAction, overturnRequestAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ImageLightbox from '@/components/ImageLightbox';

export default function RequestRow({ request, mobile = false, isSuperAdmin = false }: { request: any, mobile?: boolean, isSuperAdmin?: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleResolve = async (status: 'APPROVED' | 'DENIED') => {
    setLoading(true);
    const res = await resolveRequestAction(request.id, status);
    if (res.success) { playSuccessSound(); toast.success(res.message); }
    else { playErrorSound(); toast.error(res.message); setLoading(false); }
  };

  const handleOverturn = async () => {
    if (!confirm(`Overturn this request? Current status: ${request.status}`)) return;
    setLoading(true);
    const res = await overturnRequestAction(request.id);
    if (res.success) { playSuccessSound(); toast.success(res.message); }
    else { playErrorSound(); toast.error(res.message); }
    setLoading(false);
  };

  const receipts = Array.isArray(request.receipts)
    ? request.receipts
    : request.receipts
      ? (() => {
          try {
            return JSON.parse(request.receipts);
          } catch {
            return [];
          }
        })()
      : [];
  const isPending = request.status === 'PENDING';

  if (mobile) {
     return (
       <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
             <div>
                <p className="font-medium text-[var(--color-foreground)]">{request.user_name}</p>
                <p className="text-[10px] text-gray-500">{request.user_role}</p>
             </div>
             <p className="font-mono font-bold tracking-widest">{parseFloat(request.amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</p>
          </div>
          <p className="text-xs text-gray-300">{request.title}</p>
          {receipts.length > 0 && <ImageLightbox urls={receipts} />}
          {isPending ? (
            <div className="flex gap-2">
               <button disabled={loading} onClick={() => handleResolve('APPROVED')} className="flex-1 py-2 rounded bg-[var(--color-success)]/20 text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white transition flex items-center justify-center gap-1 font-bold text-[10px] tracking-widest disabled:opacity-50">
                  <CheckCircle className="w-3 h-3" /> APPROVE
               </button>
               <button disabled={loading} onClick={() => handleResolve('DENIED')} className="flex-1 py-2 rounded bg-[var(--color-danger)]/20 text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition flex items-center justify-center gap-1 font-bold text-[10px] tracking-widest disabled:opacity-50">
                  <XCircle className="w-3 h-3" /> DENY
               </button>
            </div>
          ) : isSuperAdmin && (
            <button disabled={loading} onClick={handleOverturn} className="w-full py-2 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition flex items-center justify-center gap-1 font-bold text-[10px] tracking-widest disabled:opacity-50">
               <RotateCcw className="w-3 h-3" /> OVERTURN ({request.status})
            </button>
          )}
       </div>
     );
  }

  return (
    <tr className="hover:bg-[var(--color-input)]/20 transition-colors">
       <td className="px-6 py-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-[var(--color-input)] flex items-center justify-center font-bold text-gray-400">
                {request.user_name.substring(0,2).toUpperCase()}
             </div>
             <div>
                <p className="font-medium text-white">{request.user_name}</p>
                <p className="text-[10px] text-gray-500">{request.user_role}</p>
             </div>
          </div>
       </td>
       <td className="px-6 py-4 font-mono font-bold tracking-widest text-[var(--color-primary)]">
          {parseFloat(request.amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF
       </td>
       <td className="px-6 py-4">
          <div className="bg-[var(--color-input)]/50 rounded p-2 text-xs text-gray-300 mb-2">{request.title}</div>
          {receipts.length > 0 && <ImageLightbox urls={receipts} />}
       </td>
       <td className="px-6 py-4 text-[10px] text-gray-500 font-mono">
          {new Date(request.created_at).toLocaleString()}
       </td>
       <td className="px-6 py-4">
          {isPending ? (
            <div className="flex gap-2 flex-wrap">
               <button disabled={loading} onClick={() => handleResolve('APPROVED')} className="px-3 py-1.5 rounded bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20 hover:bg-[var(--color-success)] hover:text-white transition flex items-center gap-1 font-bold text-[10px] tracking-widest disabled:opacity-50">
                  <CheckCircle className="w-3 h-3" /> APPROVE
               </button>
               <button disabled={loading} onClick={() => handleResolve('DENIED')} className="px-3 py-1.5 rounded bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)] hover:text-white transition flex items-center gap-1 font-bold text-[10px] tracking-widest disabled:opacity-50">
                  <XCircle className="w-3 h-3" /> DENY
               </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-start">
              <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${request.status === 'APPROVED' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                {request.status}
              </span>
              {isSuperAdmin && (
                <button disabled={loading} onClick={handleOverturn} className="px-2 py-1 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 hover:bg-[var(--color-accent)] hover:text-white transition flex items-center gap-1 font-bold text-[9px] tracking-widest disabled:opacity-50">
                  <RotateCcw className="w-3 h-3" /> OVERTURN
                </button>
              )}
            </div>
          )}
       </td>
    </tr>
  );
}
