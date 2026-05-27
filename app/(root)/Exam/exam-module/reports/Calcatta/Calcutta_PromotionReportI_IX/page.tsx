'use client';

import { getCalcuttaPromotionReportI_IX } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report-ix';
import { useState } from 'react';
import { toast } from 'sonner';
import CalcuttaPromotionReportItoIXForm from './_components/report-form';
import CalcuttaPromotionReportItoIXView from './_components/report-list';

export default function CalcuttaPromotionReportItoIXPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [dateInfo, setDateInfo] = useState<{
        issueDate?: Date;
    } | null>(null);

    const handleFormSubmit = async (payload: any, dates: any) => {
        try {
            const res = await getCalcuttaPromotionReportI_IX(payload);
            setReportData(res);
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
                <CalcuttaPromotionReportItoIXForm onSuccess={handleFormSubmit} />
                <CalcuttaPromotionReportItoIXView
                    data={reportData}
                    dateInfo={dateInfo}
                    institution={reportData?.getinstitution?.[0] || null}
                />
            </div>
        </div>
    );
}
