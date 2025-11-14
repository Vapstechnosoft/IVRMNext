'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useLeaveReport } from '@/hooks/hrms/leave-management/useReports';
import { useState } from 'react';
import { leaveReportColumns } from './_components/columns';
import { type LeaveReportFilters as FiltersType, LeaveReportFilters } from './_components/filters';

export default function LeaveReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [filters, setFilters] = useState<FiltersType>({
        company: '',
        isIndividual: false,
        employee: '',
        leave: 'All',
        fromDate: '',
        toDate: '',
        showEmployeeLeaveBalance: false
    });

    const { data: reportData, isLoading } = useLeaveReport(showReport ? filters : undefined);

    const rows = reportData?.data || [];

    const handleFilterChange = (key: keyof FiltersType, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReport = () => {
        setShowReport(true);
    };

    const handleClear = () => {
        setFilters({
            company: '',
            isIndividual: false,
            employee: '',
            leave: 'All',
            fromDate: '',
            toDate: '',
            showEmployeeLeaveBalance: false
        });
        setShowReport(false);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <LeaveReportFilters filters={filters} onFilterChange={handleFilterChange} onReport={handleReport} onCancel={handleClear} />

                {showReport && (
                    <CollapsibleSection
                        defaultOpen={rows.length > 0}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable data={rows} columns={leaveReportColumns} totalItems={rows.length} isLoading={isLoading} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
