'use client';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useMemo, useState } from 'react';
import { type GPSLog, gpsLocationReportColumns } from './_components/columns';
import { type GPSLocationReportFilters, GPSLocationReportFilters as GPSLocationReportFiltersComponent } from './_components/filters';
export default function GPSLocationReportPage() {
    const db = createLocalCrud<GPSLog>('attendance:gps-location-attendance'); // reuse same storage
    const [showReport, setShowReport] = useState(false);
    const [_selectedRows, setSelectedRows] = useState<GPSLog[]>([]);
    const [filters, setFilters] = useState<GPSLocationReportFilters>({
        filterType: 'Between Date',
        fromDate: '',
        toDate: '',
        employee: ''
    });
    const data = useMemo(() => db.list(), []);
    const employees = useMemo(() => [...new Set(data.map((d) => d.employeeName))], [data]);
    const filtered = useMemo(() => {
        return data.filter((r) => {
            if (filters.filterType === 'Employee Wise') {
                return filters.employee ? r.employeeName === filters.employee : false;
            }
            const okFrom = filters.fromDate ? new Date(r.gpsDate) >= new Date(filters.fromDate) : true;
            const okTo = filters.toDate ? new Date(r.gpsDate) <= new Date(filters.toDate) : true;
            return okFrom && okTo;
        });
    }, [data, filters]);
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
    const handleExport = () => {};
    const _handleRowSelectionChange = (rows: GPSLog[]) => {
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
                        title='Attendance GPS Location Report'
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable
                            isLoading={false}
                            columns={gpsLocationReportColumns}
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
