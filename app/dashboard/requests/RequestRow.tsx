'use client';
import { resolveRequestAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { CheckCircle, XCircle, FileImage } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function RequestRow({ request, mobile = false }: { request: any, mobile?: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleResolve = async (status: 'APPROVED' | 'DENIED') => {
    setLoading(true);
    const res = await resolveRequestAction(request.id, status);
    
    if (res.success) {
      playSuccessSound();
      toast.success(res.message);
    } else {
      playErrorSound();
      toast.error(res.message);
      setLoading(false); // only re-enable if failed, since success removes it from DOM
    }
  };

  const receipts = request.receipts || [];

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
          <div className="flex gap-2">
             <button disabled={loading} onClick={() => handleResolve('APPROVED')} className="flex-1 py-2 rounded bg-[var(--color-success)]/20 text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white transition flex items-center justify-center gap-1 font-bold text-[10px] tracking-widest disabled:opacity-50">
                <CheckCircle className="w-3 h-3" /> APPROVE
             </button>
             <button disabled={loading} onClick={() => handleResolve('DENIED')} className="flex-1 py-2 rounded bg-[var(--color-danger)]/20 text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition flex items-center justify-center gap-1 font-bold text-[10px] tracking-widest disabled:opacity-50">
                <XCircle className="w-3 h-3" /> DENY
             </button>
          </div>
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
          <div className="bg-[var(--color-input)]/50 rounded p-2 text-xs text-gray-300 mb-2">
             {request.title}
          </div>
          <div className="flex gap-2">
             {receipts.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-[var(--color-accent)] hover:underline bg-[var(--color-accent)]/10 px-2 py-1 rounded">
                   <FileImage className="w-3 h-3" /> Doc {i+1}
                </a>
             ))}
          </div>
       </td>
       <td className="px-6 py-4 text-[10px] text-gray-500 font-mono">
          {new Date(request.created_at).toLocaleString()}
       </td>
       <td className="px-6 py-4">
          <div className="flex gap-2">
             <button disabled={loading} onClick={() => handleResolve('APPROVED')} className="px-3 py-1.5 rounded bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20 hover:bg-[var(--color-success)] hover:text-white transition flex items-center gap-1 font-bold text-[10px] tracking-widest disabled:opacity-50">
                <CheckCircle className="w-3 h-3" /> APPROVE
             </button>
             <button disabled={loading} onClick={() => handleResolve('DENIED')} className="px-3 py-1.5 rounded bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)] hover:text-white transition flex items-center gap-1 font-bold text-[10px] tracking-widest disabled:opacity-50">
                <XCircle className="w-3 h-3" /> DENY
             </button>
          </div>
       </td>
    </tr>
  );
}
