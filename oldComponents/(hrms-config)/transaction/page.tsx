'use client';
import { ROUTES } from '@/constants/routes';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function page() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace(`${ROUTES.HRMS.TRANSACTIONS}${ROUTES.HRMS.TRANSACTIONS_SUB_MENUS.SALARY_APPROVAL}`);
    }, [router]);

    return <div>Redirecting...</div>;
}
