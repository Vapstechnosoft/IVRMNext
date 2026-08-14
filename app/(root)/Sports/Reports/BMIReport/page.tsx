'use client';

import { use } from 'react';
import type { IBMIReport, IBMIReportRequest } from '@/types/sports/reports/bmi-report';
import { useState } from 'react';
import ReportForm from './_components/report-form';
import ReportGrid from './_components/report-grid';
import { useQuery } from '@tanstack/react-query';
import { getBMIReport } from '@/server/sports/reports/bmi-report';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function BMIReportPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [lastFormData, setLastFormData] = useState<IBMIReportRequest | null>(null);

    const { data: reportResponse, isLoading } = useQuery({
        queryKey: ['bmiReport', lastFormData, searchParams],
        queryFn: () => getBMIReport(lastFormData!, searchParams),
        enabled: !!lastFormData,
    });

    const finalResponse = reportResponse || {
        success: true,
        message: '',
        data: [],
        total: 0
    };

    return (
        <div className='flex flex-col gap-4 p-4'>
            <ReportForm setLastFormData={setLastFormData} searchParams={searchParams} isLoading={isLoading} />
            {finalResponse.data && finalResponse.data.length > 0 && (
                <ReportGrid
                    response={finalResponse}
                    searchParams={searchParams}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}
