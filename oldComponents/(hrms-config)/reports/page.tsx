'use client';
import { ROUTES } from '@/constants/routes';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function page() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace(`${ROUTES.HRMS.REPORTS}${ROUTES.HRMS.REPORTS_SUB_MENUS.CUMULATIVE_SALARY_REPORT}`);
    }, [router]);

    return <div>Redirecting...</div>;
}


