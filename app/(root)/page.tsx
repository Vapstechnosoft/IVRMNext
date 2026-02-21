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
            router.push(
                `${ROUTES.ADMISSION.ADMISSION}${ROUTES.ADMISSION.ADMISSION_SUB_MENUS.PREADMISSION}${ROUTES.ADMISSION.ADMISSION_SUB_MENUS.PREADMISSION_SUB_MENUS.TRANSACTIONS}${ROUTES.ADMISSION.ADMISSION_SUB_MENUS.PREADMISSION_SUB_MENUS.TRANSACTIONS_SUB_MENUS.APPLICATION_FORM}`
            );
        } else if (role === ROLES.STUDENT) {
            router.push('/StudentPortal/StudentPortalDashboard');
        } else if (role === ROLES.CHAIRMAN) {
            router.push('/chairman');
        } else if (role === ROLES.STAFF) {
            router.push('/StaffPortal/staff-dashboard');
        }
        else if (session?.data?.role?.toUpperCase() === ROLES.CHAIRMAN) {
            router.push('/chairman');
        }
    }, [session?.data?.role, router]);

    return (
        <main className='container px-0 py-2'>
            {session?.data?.role !== undefined &&
                session?.data?.role.toUpperCase() !== ROLES.ADMIN &&
                session?.data?.role.toUpperCase() !== ROLES.STUDENT &&
                session?.data?.role.toUpperCase() !== ROLES.CHAIRMAN && <ParentsDashboard />}
        </main>
    );
}
