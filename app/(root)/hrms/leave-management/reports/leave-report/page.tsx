'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import { leaveReportColumns, type LeaveReportRow } from './_components/columns';
import { LeaveReportFilters, type LeaveReportFilters as FiltersType } from './_components/filters';

export default function LeaveReportPage() {
    const [rows, setRows] = useState<LeaveReportRow[]>([]);
    const [filters, setFilters] = useState<FiltersType>({
        company: '',
        isIndividual: false,
        employee: '',
        leave: 'All',
        fromDate: '',
        toDate: '',
        showEmployeeLeaveBalance: false
    });

    const handleFilterChange = (key: keyof FiltersType, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReport = () => {
        setRows(
            Array.from({ length: 12 }).map((_, i) => ({
                slNo: i + 1,
                employeeCode: '69',
                employeeName: 'R Siddesh Kumar',
                leaveName: 'Casual Leave',
                fromDate: '2025-01-01',
                toDate: '2025-01-02',
                appliedDays: 8,
                leaveStatus: 'Approved' as const,
                leaveBalance: 8
            }))
        );
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
        setRows([]);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <LeaveReportFilters filters={filters} onFilterChange={handleFilterChange} onReport={handleReport} onCancel={handleClear} />

                <CollapsibleSection
                    title='Leave Report'
                    description=''
                    defaultOpen={rows.length > 0}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable data={rows} columns={leaveReportColumns} totalItems={rows.length} isLoading={false} />
                </CollapsibleSection>
            </div>
        </div>
    );
}
