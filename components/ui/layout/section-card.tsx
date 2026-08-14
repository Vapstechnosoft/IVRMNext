'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number; // Optional duration for entry animation
}

export function SectionCard({ children, className, delay = 500 }: SectionCardProps) {
    return (
        <div
            className={cn(
                'fade-in slide-in-from-bottom-4 animate-in',
                className
            )}
            style={{ animationDuration: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
