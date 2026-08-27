'use client';

import { useDeputationMasters } from '@/hooks/timetable/useTransactions';
import { useState } from 'react';
import DeputationAssignmentTable from './_components/deputationAssignmentTable';
import DeputationForm from './_components/deputationForm';
import DeputationReport from './_components/deputationReport';

export default function DeputationPage() {
    const [reportData, setReportData] = useState<any>(null);
    const { data: masters } = useDeputationMasters();

    return (
        <div className='container mx-auto max-w-7xl space-y-8 p-4'>
            <DeputationForm onFetch={setReportData} />

            {reportData && (
                <div className='fade-in slide-in-from-bottom-4 animate-in space-y-8 duration-500'>
                    <DeputationReport data={reportData} />
                    <DeputationAssignmentTable data={reportData} masters={masters} />
                </div>
            )}
        </div>
    );
}
