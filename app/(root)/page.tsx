'use client';

import Dashboard from '@/components/ui/dashboard/dashboard';
import ParentsDashboard from '@/components/ui/dashboard/parents-dashboard';
import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
import { ROLES } from '@/constants';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Page() {
    const session = useSession();
    useEffect(() => {
        if (session?.data?.role === undefined) {
            window.location.reload();
        }
    }, [session?.data?.role]);
    return (
        <main className='container px-0 py-2'>
            {session?.data?.role !== undefined && session?.data?.role.toUpperCase() === ROLES.ADMIN && (
                <>
                    <PolygonBanner />
                    <Dashboard />
                </>
            )}
            {session?.data?.role !== undefined && session?.data?.role.toUpperCase() !== ROLES.ADMIN && <ParentsDashboard />}
        </main>
    );
}
