'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useUnauthorizedLeaveCountReport } from '@/hooks/hrms/leave-management/useReports';
import { useMemo, useState } from 'react';
import { getUnauthorizedLeaveCountColumns } from './_components/columns';
import { type UnauthorizedLeaveCountFilters as FiltersType, UnauthorizedLeaveCountFilters } from './_components/filters';

export default function UnauthorizedLeaveCountReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [filters, setFilters] = useState<FiltersType>({
        mode: 'Company Wise',
        detailLevel: 'Only Count',
        rangeMode: 'Month Wise',
        companyQuery: '',
        selectedCompanies: [],
        department: '',
        year: '2025',
        month: 'January',
        fromDate: '',
        toDate: ''
    });

    const { data: reportData, isLoading } = useUnauthorizedLeaveCountReport(showReport ? filters : undefined);

    const rows = reportData?.data || [];

    const columns = useMemo(
        () => getUnauthorizedLeaveCountColumns({ mode: filters.mode, detailLevel: filters.detailLevel }),
        [filters.mode, filters.detailLevel]
    );

    const handleFilterChange = (key: keyof FiltersType, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReport = () => {
        setShowReport(true);
    };

    const handleClear = () => {
        setFilters({
            mode: 'Company Wise',
            detailLevel: 'Only Count',
            rangeMode: 'Month Wise',
            companyQuery: '',
            selectedCompanies: [],
            department: '',
            year: '2025',
            month: 'January',
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
                        <Heading title='Leave Management' description='Unauthorized Leave Count Report' />
                    </div>
                </div>

                <UnauthorizedLeaveCountFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReport={handleReport}
                    onCancel={handleClear}
                />

                {showReport && (
                    <CollapsibleSection
                        title='Unauthorized Leave Report List'
                        description=''
                        defaultOpen={rows.length > 0}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable data={rows} columns={columns} totalItems={rows.length} isLoading={isLoading} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
