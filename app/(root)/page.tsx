'use client';

import Dashboard from '@/components/ui/dashboard/dashboard';
import { PolygonBanner } from '@/components/ui/extension/polygon-banner';

export default function Page() {
    return (
        <main className='container px-0 py-2'>
            <PolygonBanner />
            <Dashboard />
        </main>
    );
}
