'use client';
import { ROUTES } from '@/constants/routes';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function page() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace(`${ROUTES.HRMS.EMPLOYEE}${ROUTES.HRMS.EMPLOYEE_SUB_MENUS.REGISTER}`);
    }, [router]);

    return <div>Redirecting...</div>;
}
