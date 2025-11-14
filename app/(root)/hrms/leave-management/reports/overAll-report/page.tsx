'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useOverallReport } from '@/hooks/hrms/leave-management/useReports';
import { useState } from 'react';
import { overallReportColumns } from './_components/columns';
import { type OverallReportFilters as FiltersType, OverallReportFilters } from './_components/filters';

export default function LeaveOverallReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [filters, setFilters] = useState<FiltersType>({
        status: 'Applied',
        groupBy: 'Employee Wise',
        employee: '',
        company: '',
        leaveName: '',
        fromDate: undefined,
        toDate: undefined
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
            company: '',
            leaveName: '',
            fromDate: undefined,
            toDate: undefined
        });
        setShowReport(false);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <OverallReportFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReport={handleReport}
                    onCancel={handleClear}
                />

                {showReport && (
                    <CollapsibleSection
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
