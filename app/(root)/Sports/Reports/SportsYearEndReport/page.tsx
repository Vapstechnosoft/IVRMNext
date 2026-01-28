'use client';

import type { IYearEndReport } from '@/types/sports/reports/year-end-report';
import { useState } from 'react';
import ReportForm from './_components/report-form';
import ReportGrid from './_components/report-grid';

export default function SportsYearEndReportPage() {
    const [reportData, setReportData] = useState<IYearEndReport[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className='flex flex-col gap-4 p-4'>
            <ReportForm setReportData={setReportData} />
            {reportData.length > 0 && (
                <ReportGrid
                    data={reportData}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    //manualPagination={false}
                />
            )}
        </div>
    );
}
