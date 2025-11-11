'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useOverallReport } from '@/hooks/hrms/leave-management/useReports';
import { useState } from 'react';
import { overallReportColumns } from './_components/columns';
import { OverallReportFilters, type OverallReportFilters as FiltersType } from './_components/filters';

export default function LeaveOverallReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [filters, setFilters] = useState<FiltersType>({
        status: 'Applied',
        groupBy: 'Employee Wise',
        employee: '',
        fromDate: '',
        toDate: ''
    });

    const { data: reportData, isLoading } = useOverallReport(showReport ? filters : undefined);

    const rows = reportData?.data || [];

    const handleFilterChange = (key: keyof FiltersType, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReport = () => {
        setShowReport(true);
    };

    const handleClear = () => {
        setFilters({
            status: 'Applied',
            groupBy: 'Employee Wise',
            employee: '',
            fromDate: '',
            toDate: ''
        });
        setShowReport(false);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='VKS Overall Report' />
                    </div>
                </div>

                <OverallReportFilters filters={filters} onFilterChange={handleFilterChange} onReport={handleReport} onCancel={handleClear} />

                {showReport && (
                    <CollapsibleSection
                        title='Report Result'
                        description=''
                        defaultOpen={rows.length > 0}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable data={rows} columns={overallReportColumns} totalItems={rows.length} isLoading={isLoading} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
