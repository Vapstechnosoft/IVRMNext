'use client';

import type { IBirthdayMarquee } from '@/types/alumni/alumni-dashboard';

interface BirthdayMarqueeProps {
    birthdays: IBirthdayMarquee[];
}

export default function BirthdayMarquee({ birthdays }: BirthdayMarqueeProps) {
    if (!birthdays || birthdays.length === 0) return null;

    const bdayText = birthdays
        .map((b) => `${b.almsT_FirstName || ''} ${b.almsT_MiddleName || ''} ${b.almsT_LastName || ''}`.trim())
        .join(', ');

    return (
        <div className='relative flex h-12 w-full items-center overflow-hidden bg-muted/30 border-y shadow-sm'>
            <div className='absolute left-0 z-20 bg-background px-4 py-2 font-bold text-primary shadow-md border-r'>
                🎂 BIRTHDAYS
            </div>
            <div className='flex w-max animate-marquee whitespace-nowrap px-4 py-2 text-lg font-medium text-blue-600'>
                <span className='mx-8'>Happy Birthday {bdayText} 🎂</span>
                <span className='mx-8'>Happy Birthday {bdayText} 🎂</span>
                <span className='mx-8'>Happy Birthday {bdayText} 🎂</span>
                <span className='mx-8'>Happy Birthday {bdayText} 🎂</span>
            </div>
        </div>
    );
}
