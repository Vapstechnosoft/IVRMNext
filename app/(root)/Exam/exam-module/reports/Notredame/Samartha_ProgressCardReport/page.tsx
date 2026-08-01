'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import SamarthaProgressCardReportForm from './_components/report-form';
import SamarthaProgressCardReportView from './_components/report-list';

export default function SamarthaProgressCardReportPage() {
    const [reportData, setReportData] = useState<any>(null);

    return (
        <div className='flex flex-col gap-4 p-4'>
            <div className='flex flex-col gap-1'>
                <h1 className='text-2xl font-bold tracking-tight'>Samartha Progress Card Report</h1>
                <p className='text-muted-foreground'>Generate and view student progress cards.</p>
            </div>

            <SamarthaProgressCardReportForm onSuccess={(data) => setReportData(data)} />

            {reportData && (
                <div className='mt-6'>
                    <SamarthaProgressCardReportView data={reportData} />
                </div>
            )}
        </div>
    );
}
