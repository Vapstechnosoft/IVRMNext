'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeLateInEarlyOutReport, useEmployeeLateInEarlyOutReportDropdowns } from '@/hooks/hrms/attendance-management/useReports';
import { useState } from 'react';
import { employeeLateInEarlyOutReportColumns } from './_components/columns';
import {
    type EmployeeLateInEarlyOutReportFilters,
    EmployeeLateInEarlyOutReportFilters as EmployeeLateInEarlyOutReportFiltersComponent
} from './_components/filters';

export default function EmployeeLateInEarlyOutReportPage() {
    const [filters, setFilters] = useState<EmployeeLateInEarlyOutReportFilters>({
        type: [],
        department: [],
        designation: [],
        allOrIndividual: 'All',
        codeOrName: 'Code',
        query: '',
        fromDate: '',
        toDate: '',
        mode: 'Late In Early Out'
    });

    const { data: reportData, isLoading } = useEmployeeLateInEarlyOutReport(filters);
    const { data: dropdownData } = useEmployeeLateInEarlyOutReportDropdowns();

    const types = dropdownData?.data?.types || [];
    const departments = dropdownData?.data?.departments || [];
    const designations = dropdownData?.data?.designations || [];

    const filtered = reportData?.data || [];

    const handleSearch = () => {
        /* TODO: implement */
    };

    const handleCancel = () => {
        setFilters({
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            codeOrName: 'Code',
            query: '',
            fromDate: '',
            toDate: '',
            mode: 'Late In Early Out'
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
                        <Heading title='Employee LateIn EarlyOut Report' description='' />
                    </div>
                </div>

                <EmployeeLateInEarlyOutReportFiltersComponent
                    filters={filters}
                    departments={departments}
                    designations={designations}
                    types={types}
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
                        columns={employeeLateInEarlyOutReportColumns}
                        data={filtered}
                        totalItems={filtered.length}
                        showViewOptions
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
