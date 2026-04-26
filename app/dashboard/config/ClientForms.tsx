'use client';
import { addJobTitleAction, updateConfigLimitAction, updateLimitPeriodAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';

export function AddJobTitleForm() {
    const handleAdd = async (e: any) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await addJobTitleAction(fd);
        if (res.success) { playSuccessSound(); toast.success(res.message); e.target.reset(); }
        else { playErrorSound(); toast.error(res.message); }
    };

    return (
        <form onSubmit={handleAdd} className="flex gap-2 mt-4">
            <input type="text" name="title" required placeholder="e.g. Frontend Engineer" className="flex-1 bg-[var(--color-input)] border border-[var(--color-border)] rounded py-2 px-3 text-sm text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]" />
            <button type="submit" className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded px-4 text-sm font-bold tracking-widest hover:bg-[var(--color-primary-hover)] transition">ADD ROLE</button>
        </form>
    );
}

export function UpdateLimitForm({ configKey, label, currentValue }: { configKey: string, label: string, currentValue: string }) {
    const handleUpdate = async (e: any) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.append('key', configKey);
        const res = await updateConfigLimitAction(fd);
        if (res.success) { playSuccessSound(); toast.success(res.message); }
        else { playErrorSound(); toast.error(res.message); }
    };

    return (
        <form onSubmit={handleUpdate} className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</label>
            <div className="flex gap-2">
                <input type="number" name="value" defaultValue={currentValue} required className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-2 px-3 text-sm text-[var(--color-foreground)] font-mono focus:outline-none focus:border-[var(--color-primary)]" />
                <button type="submit" className="bg-[var(--color-blue)] text-white rounded px-4 text-sm font-bold tracking-widest hover:opacity-80 transition">SAVE</button>
            </div>
        </form>
    );
}

export function UpdateLimitPeriodForm({ currentValue }: { currentValue: string }) {
    const handleUpdate = async (e: any) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await updateLimitPeriodAction(fd);
        if (res.success) { playSuccessSound(); toast.success(res.message); }
        else { playErrorSound(); toast.error(res.message); }
    };

    return (
        <form onSubmit={handleUpdate} className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Spend Reset Period (Weekly / Monthly)</label>
            <div className="flex gap-2">
                <select name="period" defaultValue={currentValue || 'monthly'} className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-2 px-3 text-sm text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                <button type="submit" className="bg-[var(--color-blue)] text-white rounded px-4 text-sm font-bold tracking-widest hover:opacity-80 transition">SAVE</button>
            </div>
        </form>
    );
}
