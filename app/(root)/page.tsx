'use client';
import ParentsDashboard from '@/components/ui/dashboard/parents-dashboard';
import { ROLES } from '@/constants';
import { ROUTES } from '@/constants/routes';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.data?.role === undefined) {
            window.location.reload();
        }
    }, [session?.data?.role]);

    // Move router.push to useEffect
    useEffect(() => {
        const role = session?.data?.role?.toUpperCase();
        if (role === ROLES.ADMIN) {
            router.push('/school-admin');
        } else if (role === ROLES.CHAIRMAN) {
            router.push('/chairman');
        } else if (
            role === ROLES.GENERAL_STAFF ||
            role === ROLES.HR_ADMIN ||
            role === ROLES.SUPER_ADMIN
        ) {
            router.push('/StaffPortal/staff-dashboard');
        }
    }, [session?.data?.role, router]);

    return (
        <main className='container px-0 py-2'>
            {session?.data?.role !== undefined &&
                session?.data?.role.toUpperCase() === ROLES.ONLINE_PREADMISSION_USER &&
                <ParentsDashboard />}
        </main>
    );
}
