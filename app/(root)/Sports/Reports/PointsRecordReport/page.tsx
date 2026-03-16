'use client';

import { useState } from 'react';
import ReportForm from './_components/report-form';
import ReportGrid from './_components/report-grid';
import { IPointsRecordReportData } from '@/types/sports/reports/points-record-report';
import { PointsRecordReportFormSchema } from './schema';

export default function PointsRecordReportPage() {
    const [reportData, setReportData] = useState<IPointsRecordReportData[] | null>(null);
    const [formData, setFormData] = useState<PointsRecordReportFormSchema | null>(null);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <ReportForm setReportData={setReportData} setFormData={setFormData} />

            {reportData && (
                <ReportGrid data={reportData} formData={formData} />
            )}
        </div>
    );
}
