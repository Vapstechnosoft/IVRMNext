'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useGPSLocationReport, useGPSLocationReportDropdowns } from '@/hooks/hrms/attendance-management/useReports';
import { useState } from 'react';
import { gpsLocationReportColumns } from './_components/columns';
import { type GPSLocationReportFilters, GPSLocationReportFilters as GPSLocationReportFiltersComponent } from './_components/filters';

export default function GPSLocationReportPage() {
    const [filters, setFilters] = useState<GPSLocationReportFilters>({
        filterType: 'Between Date',
        fromDate: '',
        toDate: '',
        employee: ''
    });

    const { data: reportData, isLoading } = useGPSLocationReport(filters);
    const { data: dropdownData } = useGPSLocationReportDropdowns();

    const employees = dropdownData?.data?.employees || [];

    const filtered = reportData?.data || [];

    const handleSearch = () => {
        // TODO: Implement report generation
    };

    const handleCancel = () => {
        setFilters({
            filterType: 'Between Date',
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
                        isLoading={isLoading}
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

