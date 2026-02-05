
'use client';

import { redirect } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ReportFilters from './_components/report-filters';

export default function StudentAttendanceReportPage() {
    const { data: session, status } = useSession();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || (session.role !== 'Staff' && session.role !== 'GENERAL_STAFF')) {
            redirect('/');
        }

        setIsAuthorized(true);
    }, [session, status]);

    if (!isAuthorized) {
        return (
            <div className="container mx-auto p-4 space-y-6 min-h-screen flex items-center justify-center">
                <p className="text-lg text-muted-foreground">Checking permissions...</p>
            </div>
        );
    }

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Student Attendance Report</h1>
            </div>

            <Suspense fallback={<div>Loading report filters...</div>}>
                <ReportFilters />
            </Suspense>
        </div>
    );
}
