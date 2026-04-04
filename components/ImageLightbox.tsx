'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ImageLightbox({ urls }: { urls: string[] }) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    if (!urls || urls.length === 0) return null;

    const prev = () => setIndex(i => (i - 1 + urls.length) % urls.length);
    const next = () => setIndex(i => (i + 1) % urls.length);

    return (
        <>
            <div className="flex flex-wrap gap-2 mt-2">
                {urls.map((url, i) => (
                    <button
                        key={i}
                        onClick={() => { setIndex(i); setOpen(true); }}
                        className="w-14 h-14 rounded overflow-hidden border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)] transition"
                    >
                        <img src={url} alt={`Receipt ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
                        {/* Close */}
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute -top-10 right-0 text-white hover:text-[var(--color-primary)] transition"
                        >
                            <X className="w-7 h-7" />
                        </button>

                        {/* Image */}
                        <img
                            src={urls[index]}
                            alt={`Receipt ${index + 1}`}
                            className="w-full max-h-[80vh] object-contain rounded-lg"
                        />

                        {/* Counter */}
                        <p className="text-center text-xs text-gray-400 mt-3">{index + 1} / {urls.length}</p>

                        {/* Navigation */}
                        {urls.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 rounded-full transition"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={next}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 rounded-full transition"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
