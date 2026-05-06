'use client';

import { getCalcuttaPromotionReportI_IV } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report';
import { useState } from 'react';
import { toast } from 'sonner';
import CalcuttaPromotionReportForm from './_components/report-form';
import CalcuttaPromotionReportView from './_components/report-list';

export default function CalcuttaPromotionReportItoIVPage() {
    const [reportData, setReportData] = useState<any>(null);

    const handleFormSubmit = async (payload: any) => {
        try {
            const res = await getCalcuttaPromotionReportI_IV(payload);
            setReportData(res);
            toast.success('Report generated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
            setReportData(null);
        }
    };

    return (
        <div className='flex flex-col gap-6 p-6'>

            <div className='flex flex-col gap-6'>
                <CalcuttaPromotionReportForm onSuccess={handleFormSubmit} />
                <CalcuttaPromotionReportView
                    data={reportData}
                    institution={reportData?.getinstitution?.[0] || null}
                />
            </div>
        </div>
    );
}
