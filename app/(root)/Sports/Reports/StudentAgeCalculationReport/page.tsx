'use client';

import { useState } from 'react';
import ReportForm from './_components/report-form';
import ReportGrid from './_components/report-grid';
import { IStudentAgeReport } from '@/types/sports/reports/student-age-calculation';

export default function StudentAgeCalculationReportPage() {
    const [reportData, setReportData] = useState<IStudentAgeReport[] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="flex flex-col gap-6">
            <ReportForm onReportGenerated={setReportData} />
            {reportData && (
                <ReportGrid
                    data={reportData}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    manualPagination={false}
                />
            )}
        </div>
    );
}
