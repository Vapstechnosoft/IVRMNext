'use client';

import { getCalcuttaPromotionReportI_IX } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report-ix';
import { useState } from 'react';
import { toast } from 'sonner';
import CalcuttaPromotionReportItoIXForm from './_components/report-form';
import CalcuttaPromotionReportItoIXView from './_components/report-list';
import { Loader2 } from 'lucide-react';

export default function CalcuttaPromotionReportItoIXPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [dateInfo, setDateInfo] = useState<{
        issueDate?: Date;
    } | null>(null);

    const handleFormSubmit = async (payload: any, dates: any) => {
        try {
            setLoading(true);
            setReportData(null);
            setDateInfo(null);
            const res = await getCalcuttaPromotionReportI_IX(payload);
            console.log('Calcutta Promotion Report I-IX API response', res);
            setReportData(res);
            setDateInfo(dates);
            toast.success('Report generated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
            setReportData(null);
            setDateInfo(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col gap-6 p-6'>
            <div className='flex flex-col gap-6'>
                <CalcuttaPromotionReportItoIXForm onSuccess={handleFormSubmit} />
                {loading && (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm print:hidden">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {!loading && reportData && (
                    <CalcuttaPromotionReportItoIXView
                        data={reportData}
                        dateInfo={dateInfo}
                        institution={reportData?.getinstitution?.[0] || null}
                    />
                )}
            </div>
        </div>
    );
}
