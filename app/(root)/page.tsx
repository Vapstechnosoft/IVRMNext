'use client';
import ParentsDashboard from '@/components/ui/dashboard/parents-dashboard';
import { ROLES } from '@/constants';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Page() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/sign-in');
            return;
        }

        if (status === 'authenticated') {
            const role = session?.role?.toUpperCase();
            if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
                router.push('/school-admin');
            } else if (role === ROLES.STUDENT) {
                router.push('/StudentPortal/student-dashboard');
            } else if (role === ROLES.CHAIRMAN) {
                router.push('/chairman');
            } else if (role === ROLES.STAFF || role === ROLES.GENERAL_STAFF || role === ROLES.HR_ADMIN) {
                router.push('/StaffPortal/staff-dashboard');
            }
        }
    }, [session?.role, status, router]);

    if (status === 'loading') {
        return (
            <div className='flex h-[70vh] w-full items-center justify-center'>
                <div className='flex flex-col items-center gap-3'>
                    <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
                    <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const role = session?.role?.toUpperCase();
    const isRedirectingRole =
        role === ROLES.ADMIN ||
        role === ROLES.SUPER_ADMIN ||
        role === ROLES.STUDENT ||
        role === ROLES.CHAIRMAN ||
        role === ROLES.STAFF ||
        role === ROLES.GENERAL_STAFF ||
        role === ROLES.HR_ADMIN;

    return (
        <main className='container px-0 py-2'>
            {!isRedirectingRole && <ParentsDashboard />}
        </main>
    );
}
