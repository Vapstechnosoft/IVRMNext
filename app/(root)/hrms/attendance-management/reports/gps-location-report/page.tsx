'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useGPSLocationReport, useGPSLocationReportDropdowns } from '@/hooks/hrms/attendance-management/useReports';
import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { gpsLocationReportColumns } from './_components/columns';
import { type GPSLocationReportFilters, GPSLocationReportFilters as GPSLocationReportFiltersComponent } from './_components/filters';
import type { GPSLog } from './_components/columns';

export default function GPSLocationReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [selectedRows, setSelectedRows] = useState<GPSLog[]>([]);
    const [filters, setFilters] = useState<GPSLocationReportFilters>({
        filterType: 'Between Date',
        fromDate: '',
        toDate: '',
        employee: ''
    });

    const { data: reportData, isLoading } = useGPSLocationReport(showReport ? filters : undefined);
    const { data: dropdownData } = useGPSLocationReportDropdowns();

    const employees = dropdownData?.data?.employees || [];

    const filtered = reportData?.data || [];

    const handleSearch = () => {
        setShowReport(true);
    };

    const handleCancel = () => {
        setFilters({
            filterType: 'Between Date',
            fromDate: '',
            toDate: '',
            employee: ''
        });
        setShowReport(false);
        setSelectedRows([]);
    };

    const handleExport = () => {
        /* TODO: implement export functionality */
        console.log('Exporting selected rows:', selectedRows);
    };

    const handleRowSelectionChange = (rows: GPSLog[]) => {
        setSelectedRows(rows);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <GPSLocationReportFiltersComponent
                    filters={filters}
                    employees={employees}
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
                                columns={gpsLocationReportColumns}
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
