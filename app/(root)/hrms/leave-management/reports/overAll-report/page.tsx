'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import { overallReportColumns, type OverallReportRow } from './_components/columns';
import { OverallReportFilters, type OverallReportFilters as FiltersType } from './_components/filters';

export default function LeaveOverallReportPage() {
    const [rows, setRows] = useState<OverallReportRow[]>([]);
    const [filters, setFilters] = useState<FiltersType>({
        status: 'Applied',
        groupBy: 'Employee Wise',
        employee: '',
        fromDate: '',
        toDate: ''
    });

    const handleFilterChange = (key: keyof FiltersType, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReport = () => {
        // Demo rows; hook to API later
        setRows([
            {
                employee: 'Steffi Halian',
                leaveName: 'Sick Leave',
                fromDate: '2025-01-03',
                toDate: '2025-01-04',
                status: filters.status
            },
            {
                employee: 'Shruthi NA',
                leaveName: 'Casual Leave',
                fromDate: '2025-02-10',
                toDate: '2025-02-11',
                status: filters.status
            }
        ]);
    };

    const handleClear = () => {
        setFilters({
            status: 'Applied',
            groupBy: 'Employee Wise',
            employee: '',
            fromDate: '',
            toDate: ''
        });
        setRows([]);
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

                <CollapsibleSection
                    title='Report Result'
                    description=''
                    defaultOpen={rows.length > 0}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={rows} columns={overallReportColumns} totalItems={rows.length} isLoading={false} />
                </CollapsibleSection>
            </div>
        </div>
    );
}
