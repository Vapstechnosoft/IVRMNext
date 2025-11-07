'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useMemo, useState } from 'react';
import { type GPSLog, gpsLocationReportColumns } from './_components/columns';
import { type GPSLocationReportFilters, GPSLocationReportFilters as GPSLocationReportFiltersComponent } from './_components/filters';

export default function GPSLocationReportPage() {
    const db = createLocalCrud<GPSLog>('attendance:gps-location-attendance'); // reuse same storage
    const [filters, setFilters] = useState<GPSLocationReportFilters>({
        betweenDates: false,
        fromDate: '',
        toDate: '',
        employee: ''
    });

    const data = useMemo(() => db.list(), []);

    const employees = useMemo(() => [...new Set(data.map((d) => d.employeeName))], [data]);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okEmp = filters.employee ? r.employeeName === filters.employee : true;
            const okFrom = filters.betweenDates && filters.fromDate ? new Date(r.gpsDate) >= new Date(filters.fromDate) : true;
            const okTo = filters.betweenDates && filters.toDate ? new Date(r.gpsDate) <= new Date(filters.toDate) : true;
            return okEmp && okFrom && okTo;
        });
    }, [data, filters]);

    const handleSearch = () => {
        // TODO: Implement report generation
    };

    const handleCancel = () => {
        setFilters({
            betweenDates: false,
            fromDate: '',
            toDate: '',
            employee: ''
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
                        <Heading title='Attendance GPS Location Report' description='' />
                    </div>
                </div>

                <GPSLocationReportFiltersComponent
                    filters={filters}
                    employees={employees}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                    onExport={handleExport}
                    onPrint={handlePrint}
                />

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
            </div>
        </div>
    );
}

