'use client';

import { useState } from 'react';
import ReportForm from './_components/report-form';
import ReportGrid from './_components/report-grid';
import type { ISportHouseReportPointsResponse, ISportHouseReportPointsRequest } from '@/types/sports/reports/sport-house-report-points';

export default function SportHouseReportPointsPage() {
    const [reportResponse, setReportResponse] = useState<ISportHouseReportPointsResponse | null>(null);
    const [lastPayload, setLastPayload] = useState<ISportHouseReportPointsRequest | null>(null);

    return (
        <div className="flex flex-col gap-6 p-6">
            <ReportForm
                onReportGenerated={(data, payload) => {
                    setReportResponse(data);
                    setLastPayload(payload);
                }}
                onReset={() => {
                    setReportResponse(null);
                    setLastPayload(null);
                }}
            />
            {reportResponse && (
                <ReportGrid
                    data={reportResponse}
                    yearName="2026-2027"
                />
            )}
        </div>
    );
}
