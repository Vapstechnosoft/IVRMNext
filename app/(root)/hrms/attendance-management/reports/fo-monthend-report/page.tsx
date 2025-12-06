'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFOMonthEndReportOnload } from '@/hooks/hrms/useReports';
import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { foMonthEndReportColumns } from './_components/columns';
import type { FOMonthEndReportRow } from './_components/columns';
import { type FOMonthEndReportFilters, FOMonthEndReportFilters as FOMonthEndReportFiltersComponent } from './_components/filters';
export default function FOMonthEndReportPage() {
    const [showReport, setShowReport] = useState(false);
    const [selectedRows, setSelectedRows] = useState<FOMonthEndReportRow[]>([]);
    const [filters, setFilters] = useState<FOMonthEndReportFilters>({
        year: '',
        month: '',
        ieName: ''
    });
    // Fetch onload data from API
    const { data: onloadData, isLoading: isLoadingOnload } = useFOMonthEndReportOnload();
    const filtered: FOMonthEndReportRow[] = [];
    const handleSearch = () => {
        // TODO: Implement search functionality when the search endpoint is available
        // For now, just show the report section
        setShowReport(true);
    };
    const handleCancel = () => {
        setFilters({
            year: '',
            month: '',
            ieName: ''
        });
        setShowReport(false);
        setSelectedRows([]);
    };
    const handleExport = () => {};
    const _handleRowSelectionChange = (rows: FOMonthEndReportRow[]) => {
        setSelectedRows(rows);
    };
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <FOMonthEndReportFiltersComponent
                    filters={filters}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
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
                                isLoading={false}
                                columns={foMonthEndReportColumns}
                                data={filtered}
                                totalItems={filtered.length}
                                showViewOptions
                            />
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
