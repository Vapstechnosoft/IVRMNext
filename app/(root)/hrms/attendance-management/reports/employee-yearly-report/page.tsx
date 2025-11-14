'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeYearlyReport, useEmployeeYearlyReportDropdowns } from '@/hooks/hrms/attendance-management/useReports';
import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { employeeYearlyReportColumns } from './_components/columns';
import {
    type EmployeeYearlyReportFilters,
    EmployeeYearlyReportFilters as EmployeeYearlyReportFiltersComponent
} from './_components/filters';
import type { YearRow } from './_components/columns';

export default function EmployeeYearlyReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [selectedRows, setSelectedRows] = useState<YearRow[]>([]);
    const [filters, setFilters] = useState<EmployeeYearlyReportFilters>({
        type: [],
        department: [],
        designation: [],
        allOrIndividual: 'All',
        employee: '',
        fromDate: '',
        toDate: '',
        mode: []
    });

    const { data: reportData, isLoading } = useEmployeeYearlyReport(showReport ? filters : undefined);
    const { data: dropdownData } = useEmployeeYearlyReportDropdowns();

    const employees = dropdownData?.data?.employees || [];
    const types = dropdownData?.data?.types || [];
    const departments = dropdownData?.data?.departments || [];
    const designations = dropdownData?.data?.designations || [];

    const filtered = reportData?.data || [];

    const handleSearch = () => {
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
            toDate: '',
            mode: []
        });
        setShowReport(false);
        setSelectedRows([]);
    };

    const handleExport = () => {
        /* TODO: implement export functionality */
        console.log('Exporting selected rows:', selectedRows);
    };

    const handleRowSelectionChange = (rows: YearRow[]) => {
        setSelectedRows(rows);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
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
                    onPrint={() => window.print()}
                />

                {showReport && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-4'>
                            {selectedRows.length > 0 && (
                                <div className='flex justify-end'>
                                    <Button variant='default' onClick={handleExport}>
                                        <FileDown className='mr-2 h-4 w-4' /> EXPORT TO EXCEL
                                    </Button>
                                </div>
                            )}
                            <GenericDataTable
                                isLoading={isLoading}
                                columns={employeeYearlyReportColumns}
                                data={filtered}
                                totalItems={filtered.length}
                                showViewOptions
                                onRowSelectionChange={handleRowSelectionChange}
                            />
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
