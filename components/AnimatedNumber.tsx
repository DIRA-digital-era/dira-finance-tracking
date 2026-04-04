'use client';

import { useState, useEffect } from 'react';

export default function AnimatedNumber({ value, durationMs = 4000 }: { value: number, durationMs?: number }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            // easeOutExpo for dramatic cyber-accounting vibe
            const ratio = Math.min(progress / durationMs, 1);
            const easeRatio = ratio === 1 ? 1 : 1 - Math.pow(2, -10 * ratio);

            const current = value * easeRatio;
            setDisplay(current);

            if (ratio < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplay(value);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, durationMs]);

    return <>{display.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</>;
}
