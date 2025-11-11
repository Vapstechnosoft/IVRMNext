'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeLogReport } from '@/hooks/hrms/attendance-management/useReports';
import { useState } from 'react';
import { LogReportFilters, type LogReportFiltersState } from './_components/filters';
import { logReportColumns } from './_components/columns';

export default function EmployeeLogReportPage() {
    const [filters, setFilters] = useState<LogReportFiltersState>({
        type: [],
        department: [],
        designation: [],
        allOrIndividual: 'All',
        codeOrName: 'Code',
        query: '',
        dateMode: 'Date',
        date: '',
        month: '',
        fromDate: '',
        toDate: '',
        metric: 'Punch Time'
    });

    const { data: reportData, isLoading } = useEmployeeLogReport(filters);

    const filtered = reportData?.data || [];
    const data = filtered; // For filter component compatibility

    const handleReport = () => {
        /* TODO: implement */
    };
    const handleExport = () => {
        /* TODO: implement */
    };
    const handlePrint = () => window.print();

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Employee Log Report' description='' />
                    </div>
                </div>

                <LogReportFilters
                    filters={filters}
                    data={data}
                    onFilterChange={setFilters}
                    onReport={handleReport}
                    onExport={handleExport}
                    onPrint={handlePrint}
                />

                <CollapsibleSection
                    title='Employee Log Report'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable isLoading={isLoading} columns={logReportColumns} data={filtered} totalItems={filtered.length} showViewOptions />
                </CollapsibleSection>
            </div>
        </div>
    );
}
