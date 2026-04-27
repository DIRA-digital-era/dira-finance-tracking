'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

// Chart component wrapper for displaying expense velocity data
export default function ChartWrapper({ data }: { data: any[] }) {
  return (
    // Responsive container that adapts to parent width
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        {/* Gradient definition for area fill */}
        <defs>
          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        {/* X-axis with minimal styling */}
        <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
        {/* Tooltip with theme-aware styling */}
        <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }} />
        {/* Area chart with gradient fill */}
        <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
