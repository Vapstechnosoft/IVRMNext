'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeInOutReport, useEmployeeInOutReportDropdowns } from '@/hooks/hrms/attendance-management/useReports';
import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { employeeInOutReportColumns } from './_components/columns';
import { type EmployeeInOutReportFilters, EmployeeInOutReportFilters as EmployeeInOutReportFiltersComponent } from './_components/filters';
import type { InOutRow } from './_components/columns';

export default function EmployeeInOutReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [selectedRows, setSelectedRows] = useState<InOutRow[]>([]);
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

    const { data: reportData, isLoading } = useEmployeeInOutReport(showReport ? filters : undefined);
    const { data: dropdownData } = useEmployeeInOutReportDropdowns();

    const departments = dropdownData?.data?.departments || [];
    const designations = dropdownData?.data?.designations || [];

    const filtered = reportData?.data || [];

    const handleSearch = () => {
        setShowReport(true);
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
        setShowReport(false);
        setSelectedRows([]);
    };

    const handleExport = () => {
        /* TODO: implement export functionality */
        console.log('Exporting selected rows:', selectedRows);
    };

    const handleRowSelectionChange = (rows: InOutRow[]) => {
        setSelectedRows(rows);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <EmployeeInOutReportFiltersComponent
                    filters={filters}
                    branches={[]}
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
                                columns={employeeInOutReportColumns}
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
