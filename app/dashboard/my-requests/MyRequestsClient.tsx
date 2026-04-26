'use client';
import { useState } from 'react';
import { LayoutGrid, Table } from 'lucide-react';
import ImageLightbox from '@/components/ImageLightbox';

const STATUS_STYLES: Record<string, string> = {
  APPROVED: 'bg-green-500/10 text-green-400 border border-green-500/20',
  DENIED: 'bg-red-500/10 text-red-400 border border-red-500/20',
  PENDING: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

function normalizeReceipts(value: any) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export default function MyRequestsClient({ records }: { records: any[] }) {
  const [view, setView] = useState<'table' | 'cards'>('table');

  const ViewToggle = () => (
    <div className="flex bg-[var(--color-input)] p-1 rounded-lg">
      <button onClick={() => setView('table')} className={`px-3 py-1 rounded text-xs font-bold tracking-widest transition flex items-center gap-1 ${view === 'table' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-slate-600 hover:text-[var(--color-foreground)]'}`}>
        <Table className="w-3 h-3" /> Table
      </button>
      <button onClick={() => setView('cards')} className={`px-3 py-1 rounded text-xs font-bold tracking-widest transition flex items-center gap-1 ${view === 'cards' ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]' : 'text-slate-600 hover:text-[var(--color-foreground)]'}`}>
        <LayoutGrid className="w-3 h-3" /> Cards
      </button>
    </div>
  );

  if (view === 'cards') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-600">{records.length} submission{records.length !== 1 ? 's' : ''}</p>
          <ViewToggle />
        </div>
        {records.length === 0 && <p className="text-center text-slate-700 py-12">No submissions found.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r: any) => (
            <div key={r.id} className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 hover:border-[var(--color-primary)]/40 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-[10px] text-slate-700">#DRF-{1000 + r.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${STATUS_STYLES[r.status] || STATUS_STYLES.PENDING}`}>{r.status}</span>
              </div>
              <p className="font-bold text-[var(--color-foreground)] mb-1">{r.title}</p>
              <p className="text-sm text-slate-800 font-mono font-bold mt-2">{parseFloat(r.amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</p>
              <p className="text-[10px] text-slate-700 font-mono mt-2">{new Date(r.created_at).toLocaleString()}</p>
              {normalizeReceipts(r.receipts).length > 0 && <ImageLightbox urls={normalizeReceipts(r.receipts)} />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/50 flex justify-between items-center">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-primary)]">All Submitted Requests</p>
          <ViewToggle />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--color-foreground)]">
            <thead className="text-[10px] uppercase bg-[var(--color-input)]/50 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">ID</th>
                <th className="px-6 py-4 font-medium tracking-wider">Title</th>
                <th className="px-6 py-4 font-medium tracking-wider hidden md:table-cell">Date</th>
                <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {records.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-700">No submissions found.</td></tr>
              ) : (
                records.map((r: any) => {
                  const receipts = normalizeReceipts(r.receipts);
                  return (
                    <tr key={r.id} className="hover:bg-[var(--color-input)] transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-700">#DRF-{1000 + r.id}</td>
                      <td className="px-6 py-4 text-[var(--color-foreground)] font-medium">
                        {r.title}
                        {receipts.length > 0 && <ImageLightbox urls={receipts} />}
                      </td>
                      <td className="px-6 py-4 text-[10px] text-slate-700 font-mono hidden md:table-cell">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono font-bold">{parseFloat(r.amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} XAF</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${STATUS_STYLES[r.status] || STATUS_STYLES.PENDING}`}>{r.status}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
