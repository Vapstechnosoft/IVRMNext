'use client';

import { getCalcuttaPromotionReportI_V } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report';
import { useState } from 'react';
import { toast } from 'sonner';
import CalcuttaPromotionReportForm from './_components/report-form';
import CalcuttaPromotionReportView from './_components/report-list';

export default function CalcuttaPromotionReportItoVPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [dateInfo, setDateInfo] = useState<{
        academicDate: Date;
        reportPrintedDate?: Date;
        issueDate: Date;
    } | null>(null);

    const handleFormSubmit = async (payload: any, dates: any) => {
        try {
            const res = await getCalcuttaPromotionReportI_V(payload);
            setReportData({ ...res });
            setDateInfo(dates);
            toast.success('Report generated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
            setReportData(null);
            setDateInfo(null);
        }
    };

    return (
        <div className='flex flex-col gap-6 p-6'>
            <div className='flex flex-col gap-6'>
                <CalcuttaPromotionReportForm onSuccess={handleFormSubmit} />
                <CalcuttaPromotionReportView
                    data={reportData}
                    dateInfo={dateInfo}
                    institution={reportData?.getinstitution?.[0] || null}
                />
            </div>
        </div>
    );
}
