'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitRequest } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { UploadCloud, X, ArrowLeft, Banknote } from 'lucide-react';
import Link from 'next/link';

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 4) {
        toast.error('Maximum 4 receipts allowed');
        playErrorSound();
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // remove default browser inputs for files and append our state
    formData.delete('receipts_input'); 
    files.forEach((f) => formData.append('receipts', f));

    const res = await submitRequest(formData);

    if (res.success) {
      playSuccessSound();
      toast.success(res.message);
      router.push('/dashboard');
    } else {
      playErrorSound();
      toast.error(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 border border-[var(--color-border)] rounded hover:bg-[var(--color-card)] transition">
           <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">INITIATE FUND REQUEST</h1>
      </div>
      
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Expenditure Title</label>
              <input name="title" required type="text" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded p-3 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]" placeholder="e.g. Server Procurement" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Requested Amount (XAF)</label>
              <div className="relative">
                 <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input name="amount" required type="number" step="0.01" min="0" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] font-mono text-lg" placeholder="0.00" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Justification</label>
              <textarea name="description" required rows={4} className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded p-3 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]" placeholder="Detailed reason for this Employee expense..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Receipts / Proof / Invoices (Max 4)</label>
              
              <div className="mt-2 flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[var(--color-border)] border-dashed rounded-lg cursor-pointer bg-[var(--color-input)] hover:bg-[var(--color-card-solid)] transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-2 text-slate-500" />
                          <p className="mb-2 text-sm text-slate-600"><span className="font-semibold">Click to upload</span></p>
                      </div>
                      <input name="receipts_input" type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                  </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {files.map((file, fileIndex) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={fileIndex} className="relative group rounded-lg border border-[var(--color-primary)]/40 overflow-hidden bg-[var(--color-background)] aspect-square">
                         <img src={url} alt={file.name} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                           <p className="text-[9px] text-white text-center px-1 break-all">{file.name}</p>
                         </div>
                         <button type="button" onClick={() => removeFile(fileIndex)} className="absolute top-1 right-1 bg-red-500 rounded-full text-white p-0.5 hover:bg-red-600 transition">
                            <X className="w-3 h-3" />
                         </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 rounded bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-bold tracking-widest hover:bg-[var(--color-primary-hover)] transition focus:outline-none disabled:opacity-50">
            {loading ? 'TRANSMITTING...' : 'SUBMIT Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
