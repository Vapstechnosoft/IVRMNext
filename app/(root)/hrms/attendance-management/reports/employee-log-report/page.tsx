'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEmployeeLogReport } from '@/hooks/hrms/attendance-management/useReports';
import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { logReportColumns } from './_components/columns';
import { LogReportFilters, type LogReportFiltersState } from './_components/filters';
import type { LogRow } from './_components/columns';

export default function EmployeeLogReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [selectedRows, setSelectedRows] = useState<LogRow[]>([]);
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

    const { data: reportData, isLoading } = useEmployeeLogReport(showReport ? filters : undefined);

    const filtered = reportData?.data || [];
    const data = filtered; // For filter component compatibility

    const handleReport = () => {
        setShowReport(true);
    };

    const handleCancel = () => {
        setFilters({
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
        setShowReport(false);
        setSelectedRows([]);
    };

    const handleExport = () => {
        /* TODO: implement export functionality */
        console.log('Exporting selected rows:', selectedRows);
    };

    const handleRowSelectionChange = (rows: LogRow[]) => {
        setSelectedRows(rows);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <LogReportFilters
                    filters={filters}
                    data={data}
                    onFilterChange={setFilters}
                    onReport={handleReport}
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
                                columns={logReportColumns}
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
