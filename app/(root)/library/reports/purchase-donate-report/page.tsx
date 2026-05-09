'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { usePurchaseDonateReportSearch } from '@/hooks/library/reports/usePurchaseDonateReport';
import type { IPurchaseDonateReportGridData, IPurchaseDonateReportRequest } from '@/types/library/reports/purchase-donate-report';
import { useState } from 'react';
import { columns } from './_components/columns';
import { ReportForm } from './_components/report-form';

export default function PurchaseDonateReportPage() {
    const [reportData, setReportData] = useState<IPurchaseDonateReportGridData[]>([]);

    const searchMutation = usePurchaseDonateReportSearch();

    const handleSearch = (data: IPurchaseDonateReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response) => {
                // server returns the data array directly
                setReportData(Array.isArray(response) ? response : []);
            }
        });
    };

    return (
        <div className='space-y-4'>
            <ReportForm onSearch={handleSearch} isLoading={searchMutation.isPending} />

            {reportData.length > 0 && (
                <div className='bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400 p-4'>
                    <GenericDataTable columns={columns} data={reportData} isLoading={false} />
                </div>
            )}
        </div>
    );
}
