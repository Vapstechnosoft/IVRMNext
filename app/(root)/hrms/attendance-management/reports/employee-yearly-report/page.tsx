'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useMemo, useState } from 'react';
import { type YearRow, employeeYearlyReportColumns } from './_components/columns';
import {
    type EmployeeYearlyReportFilters,
    EmployeeYearlyReportFilters as EmployeeYearlyReportFiltersComponent
} from './_components/filters';

export default function EmployeeYearlyReportPage() {
    const db = createLocalCrud<YearRow>('attendance:year');

    const [filters, setFilters] = useState<EmployeeYearlyReportFilters>({
        allOrIndividual: 'All',
        employee: '',
        fromDate: '',
        toDate: ''
    });

    const data = useMemo(() => db.list(), []);

    const employees = useMemo(() => [...new Set(data.map((d) => d.employeeName))], [data]);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okEmp = filters.allOrIndividual === 'Individual' && filters.employee ? r.employeeName === filters.employee : true;
            const okDateFrom = filters.fromDate ? new Date(r.dateOfJoining) >= new Date(filters.fromDate) : true;
            const okDateTo = filters.toDate ? new Date(r.dateOfJoining) <= new Date(filters.toDate) : true;
            return okEmp && okDateFrom && okDateTo;
        });
    }, [data, filters]);

    const handleSearch = () => {
        // TODO: Implement report generation
    };

    const handleCancel = () => {
        setFilters({
            allOrIndividual: 'All',
            employee: '',
            fromDate: '',
            toDate: ''
        });
    };

    const handleExport = () => {
        // TODO: Implement export functionality
    };

    const handlePrint = () => window.print();

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Employee Yearly Report' description='' />
                    </div>
                </div>

                <EmployeeYearlyReportFiltersComponent
                    filters={filters}
                    employees={employees}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                    onExport={handleExport}
                    onPrint={handlePrint}
                />

                <CollapsibleSection
                    title='Grid View'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable
                        isLoading={false}
                        columns={employeeYearlyReportColumns}
                        data={filtered}
                        totalItems={filtered.length}
                        showViewOptions
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
