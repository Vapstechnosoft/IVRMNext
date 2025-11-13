'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeInOutReport, useEmployeeInOutReportDropdowns } from '@/hooks/hrms/attendance-management/useReports';
import { useState } from 'react';
import { employeeInOutReportColumns } from './_components/columns';
import { type EmployeeInOutReportFilters, EmployeeInOutReportFilters as EmployeeInOutReportFiltersComponent } from './_components/filters';

export default function EmployeeInOutReportPage() {
    const [filters, setFilters] = useState<EmployeeInOutReportFilters>({
        branch: '',
        type: [],
        department: [],
        designation: [],
        allOrIndividual: 'All',
        codeOrName: 'Code',
        query: '',
        fromDate: '',
        toDate: '',
        timeInTimeOut: undefined
    });

    const { data: reportData, isLoading } = useEmployeeInOutReport(filters);
    const { data: dropdownData } = useEmployeeInOutReportDropdowns();

    const branches = dropdownData?.data?.branches || [];
    const departments = dropdownData?.data?.departments || [];
    const designations = dropdownData?.data?.designations || [];

    const filtered = reportData?.data || [];

    const handleSearch = () => {
        /* TODO: implement */
    };

    const handleCancel = () => {
        setFilters({
            branch: '',
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            codeOrName: 'Code',
            query: '',
            fromDate: '',
            toDate: '',
            timeInTimeOut: undefined
        });
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
                        <Heading title='Employee In Out Report' description='' />
                    </div>
                </div>

                <EmployeeInOutReportFiltersComponent
                    filters={filters}
                    branches={branches}
                    departments={departments}
                    designations={designations}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                    onExport={handleExport}
                    onPrint={handlePrint}
                />

                <CollapsibleSection
                    title='Employee In/Out Report'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable
                        isLoading={isLoading}
                        columns={employeeInOutReportColumns}
                        data={filtered}
                        totalItems={filtered.length}
                        showViewOptions
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
