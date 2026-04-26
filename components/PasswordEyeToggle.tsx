'use client';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function PasswordEyeToggle() {
    const [show, setShow] = useState(false);
    return (
        <div className="w-full relative mt-1">
            <input 
              name="password"
              type={show ? 'text' : 'password'}
              required
              placeholder="Security Key (Password)"
              className="block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] py-3 pl-10 pr-10 text-[var(--color-foreground)] placeholder-slate-500 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all" 
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[var(--color-foreground)] transition">
               {show ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
            </button>
        </div>
    );
}
