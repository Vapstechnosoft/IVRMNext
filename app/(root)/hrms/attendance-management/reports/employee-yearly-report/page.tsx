'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeYearlyReport, useEmployeeYearlyReportDropdowns } from '@/hooks/hrms/attendance-management/useReports';
import { useState } from 'react';
import { employeeYearlyReportColumns } from './_components/columns';
import {
    type EmployeeYearlyReportFilters,
    EmployeeYearlyReportFilters as EmployeeYearlyReportFiltersComponent
} from './_components/filters';

export default function EmployeeYearlyReportPage() {
    const [filters, setFilters] = useState<EmployeeYearlyReportFilters>({
        type: [],
        department: [],
        designation: [],
        allOrIndividual: 'All',
        employee: '',
        fromDate: '',
        toDate: ''
    });

    const { data: reportData, isLoading } = useEmployeeYearlyReport(filters);
    const { data: dropdownData } = useEmployeeYearlyReportDropdowns();

    const employees = dropdownData?.data?.employees || [];
    const types = dropdownData?.data?.types || [];
    const departments = dropdownData?.data?.departments || [];
    const designations = dropdownData?.data?.designations || [];

    const filtered = reportData?.data || [];

    const handleSearch = () => {
        // TODO: Implement report generation
    };

    const handleCancel = () => {
        setFilters({
            type: [],
            department: [],
            designation: [],
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
                    types={types}
                    departments={departments}
                    designations={designations}
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
                        isLoading={isLoading}
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
