'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
    const [greeting, setGreeting] = useState('');
    useEffect(() => {
        // Set greeting based on time of day
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    return (
        <div className='flex min-h-screen flex-col bg-background md:flex-row'>
            <h1 className='font-bold text-2xl tracking-tight md:text-3xl'>{greeting}!</h1>
            <p className='text-muted-foreground'>Here is an overview of the current developments at your institution today.</p>
        </div>
    );
}
