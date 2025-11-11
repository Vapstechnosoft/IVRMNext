'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeAbsentReport, useEmployeeAbsentReportDropdowns } from '@/hooks/hrms/attendance-management/useReports';
import { useState } from 'react';
import { employeeAbsentReportColumns } from './_components/columns';
import {
    type EmployeeAbsentReportFilters,
    EmployeeAbsentReportFilters as EmployeeAbsentReportFiltersComponent
} from './_components/filters';

export default function EmployeeAbsentReportPage() {
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<EmployeeAbsentReportFilters>({
        type: [],
        department: [],
        designation: [],
        allOrIndividual: 'All',
        employee: '',
        fromDate: '',
        toDate: ''
    });

    const { data: reportData, isLoading } = useEmployeeAbsentReport(showReport ? filters : undefined);
    const { data: dropdownData } = useEmployeeAbsentReportDropdowns();

    const types = dropdownData?.data?.types || [];
    const departments = dropdownData?.data?.departments || [];
    const designations = dropdownData?.data?.designations || [];
    const employees = dropdownData?.data?.employees || [];

    const filtered = reportData?.data || [];

    const handleSearch = () => {
        // Validate required fields
        if (filters.type.length === 0 || filters.department.length === 0 || filters.designation.length === 0) {
            return;
        }
        if (!filters.fromDate || !filters.toDate) {
            return;
        }
        if (filters.allOrIndividual === 'Individual' && !filters.employee) {
            return;
        }
        setShowReport(true);
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
        setShowReport(false);
    };

    const handleExport = () => {
        /* TODO: implement */
    };

    const handlePrint = () => window.print();

    const reportTitle = showReport && filters.fromDate && filters.toDate
        ? `Monthly Report from ${new Date(filters.fromDate).toLocaleDateString('en-GB')} to ${new Date(filters.toDate).toLocaleDateString('en-GB')}`
        : 'GRID VIEW';

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Employee Absent Detail Report' description='' />
                    </div>
                </div>

                <EmployeeAbsentReportFiltersComponent
                    filters={filters}
                    types={types}
                    departments={departments}
                    designations={designations}
                    employees={employees}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                    onExport={handleExport}
                    onPrint={handlePrint}
                />

                {showReport && (
                    <CollapsibleSection
                        title={reportTitle}
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable
                            isLoading={isLoading}
                            columns={employeeAbsentReportColumns}
                            data={filtered}
                            totalItems={filtered.length}
                            showViewOptions
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}

