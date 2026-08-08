'use client';

import { useState } from 'react';
import { AddForm } from '../NurseryEmojiReportCard/_components/report-form';
import { ReportList } from '../NurseryEmojiReportCard/_components/report-list';

/**
 * Nursery Emoji Report Card Page
 */

export default function NurseryEmojiReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportParams, setReportParams] = useState<any>(null);

    const handleReportGenerated = (data: any, params: any) => {
        setReportData(data);
        setReportParams(params);
    };

    const handleReset = () => {
        setReportData(null);
        setReportParams(null);
    };

    return (
        <div className='flex flex-col gap-8 p-4 md:p-8'>
            <AddForm onReportGenerated={handleReportGenerated} onReset={handleReset} />
            
            {reportParams && (
                <ReportList data={reportData} params={reportParams} />
            )}
        </div>
    );
}
