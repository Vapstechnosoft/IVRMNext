'use client';

import { useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportGrid } from './_components/report-grid';

export default function VenueWiseParticipationReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [showNoRecords, setShowNoRecords] = useState(false);

    const handleReportGenerated = (data: any[]) => {
        setReportData(data);
        setShowNoRecords(data.length === 0);
    };

    return (
        <div className='container mx-auto space-y-8 p-6'>
            <div className='flex flex-col space-y-2'>
                <h1 className='font-bold text-2xl tracking-tight'>Venue Wise Participation Report</h1>
                <p className='text-muted-foreground'>Generate reports based on House or Class/Section participation per venue.</p>
            </div>

            <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
                <div className='mb-4 flex items-center justify-between'>
                    <h2 className='font-semibold text-lg'>Report Selection</h2>
                </div>

                <ReportForm
                    onReportGenerated={handleReportGenerated}
                    onReset={() => {
                        setReportData([]);
                        setShowNoRecords(false);
                    }}
                />
            </div>

            {reportData.length > 0 ? (
                <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
                    <div className='mb-4 flex items-center justify-between'>
                        <h2 className='font-semibold text-lg'>Venue Wise Participation Report</h2>
                    </div>
                    <ReportGrid data={reportData} />
                </div>
            ) : (
                showNoRecords && (
                    <div className='rounded-lg border bg-card p-6 py-10 text-center text-card-foreground shadow-sm'>
                        <p className='font-medium text-muted-foreground'>No records found for the selected criteria.</p>
                    </div>
                )
            )}
        </div>
    );
}
