'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useHolidayReport } from '@/hooks/hrms/attendance-management/useReports';
import { useEffect, useState } from 'react';
import { holidayReportColumns } from './_components/columns';
import {
    type HolidayReportFilters,
    HolidayReportFilters as HolidayReportFiltersComponent
} from './_components/filters';

export default function HolidayReportPage() {
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const [showReport, setShowReport] = useState(false);

    // Set current year client-side only to prevent hydration mismatch
    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    // Generate calendar years starting from current year
    const calendarYears = currentYear
        ? Array.from({ length: 6 }, (_, i) => (currentYear + i).toString())
        : [];

    const [filters, setFilters] = useState<HolidayReportFilters>({
        calendarYear: '',
        holidayType: ''
    });

    const { data: reportData, isLoading } = useHolidayReport(showReport ? filters : undefined);

    const filtered = reportData?.data || [];

    const handleSearch = () => {
        if (filters.calendarYear && filters.holidayType) {
            setShowReport(true);
        }
    };

    const handleCancel = () => {
        setFilters({
            calendarYear: '',
            holidayType: ''
        });
        setShowReport(false);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Holiday Report' description='' />
                    </div>
                </div>

                <HolidayReportFiltersComponent
                    filters={filters}
                    calendarYears={calendarYears}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                />

                {showReport && (
                    <CollapsibleSection
                        title='HOLIDAY REPORT'
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable
                            isLoading={isLoading}
                            columns={holidayReportColumns}
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

