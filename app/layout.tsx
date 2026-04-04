import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "DIRA Financials",
  description: "Internal Ledger for DIRA Tech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased`}>
        {children}
        <Toaster 
           theme="dark" 
           position="bottom-right" 
           toastOptions={{
             style: {
               background: 'var(--color-card-solid)',
               border: '1px solid var(--color-border)',
               color: 'var(--color-foreground)'
             }
           }} 
        />
      </body>
    </html>
  );
}
