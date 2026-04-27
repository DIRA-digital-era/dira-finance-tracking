'use client';

import { useState, useEffect } from 'react';

// Animated number component that smoothly counts up to a target value
export default function AnimatedNumber({ value, durationMs = 4000 }: { value: number, durationMs?: number }) {
    // Current displayed value during animation
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        // Animation loop using requestAnimationFrame
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            // easeOutExpo easing function for smooth cyber-accounting animation
            const ratio = Math.min(progress / durationMs, 1);
            const easeRatio = ratio === 1 ? 1 : 1 - Math.pow(2, -10 * ratio);

            // Calculate current animated value
            const current = value * easeRatio;
            setDisplay(current);

            // Continue animation or finish
            if (ratio < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplay(value);
            }
        };

        // Start animation
        animationFrame = requestAnimationFrame(animate);
        // Cleanup animation frame on unmount or value change
        return () => cancelAnimationFrame(animationFrame);
    }, [value, durationMs]);

    // Render formatted number with thousand separators
    return <>{display.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</>;
}
