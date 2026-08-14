'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useLibLostBookReportSearch } from '@/hooks/library/reports/useLibLostBookReport';
import type { ILibLostBookReportGridData, ILibLostBookReportRequest } from '@/types/library/reports/lib-lost-book-report';
import { useState } from 'react';
import { LibLostBookReportColumns } from './_components/columns';
import { ReportForm } from './_components/report-form';
import { toast } from 'sonner';

export default function LibLostBookReportPage() {
    const [reportData, setReportData] = useState<ILibLostBookReportGridData[]>([]);

    const searchMutation = useLibLostBookReportSearch();

    const handleSearch = (data: ILibLostBookReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response) => {
                setReportData(response || []);
                if(response.length === 0) {
                    toast.warning('No records found for the given criteria.');
                    return;
                }
                if(response.length > 0) {
                    toast.success(`Report fetched successfully with ${response.length} records.`);
                }
            }
        });
    };

    return (
        <div className='space-y-6 p-4 bg-background min-h-screen'>
            <div className='max-w-5xl mx-auto'>
                <ReportForm onSearch={handleSearch} isLoading={searchMutation.isPending} />

                {reportData.length > 0 && (
                    <div className='mt-8 pt-8 border-t'>
                        <h2 className='text-lg font-bold mb-4'>Report Details</h2>
                        <GenericDataTable columns={LibLostBookReportColumns} data={reportData} isLoading={false} />
                    </div>
                )}
            </div>
        </div>
    );
}
