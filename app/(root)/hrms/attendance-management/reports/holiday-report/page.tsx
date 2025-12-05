'use client';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import type { MasterHoliday } from '../../masters/master-holiday/_components/columns';
import { type HolidayReportRow, holidayReportColumns } from './_components/columns';
import { type HolidayReportFilters, HolidayReportFilters as HolidayReportFiltersComponent } from './_components/filters';
export default function HolidayReportPage() {
    const holidayDB = createLocalCrud<MasterHoliday>('master:holiday');
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const [showReport, setShowReport] = useState(false);
    // Set current year client-side only to prevent hydration mismatch
    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);
    // Generate calendar years starting from current year
    const calendarYears = currentYear ? Array.from({ length: 6 }, (_, i) => (currentYear + i).toString()) : [];
    const [filters, setFilters] = useState<HolidayReportFilters>({
        calendarYear: '',
        holidayType: ''
    });
    const allHolidays = useMemo(() => holidayDB.list(), []);
    const filtered = useMemo(() => {
        if (!showReport) return [];
        return allHolidays
            .filter((holiday) => {
                const okYear = filters.calendarYear ? holiday.calendarYear === filters.calendarYear : true;
                const okType = filters.holidayType ? holiday.holidayType === filters.holidayType : true;
                return okYear && okType;
            })
            .map((holiday) => ({
                id: holiday.id,
                createdAt: holiday.createdAt,
                calendarYear: holiday.calendarYear,
                department: holiday.department,
                holidayType: holiday.holidayType,
                name: holiday.name,
                fromDate: holiday.fromDate,
                toDate: holiday.toDate,
                isActive: holiday.isActive
            })) as HolidayReportRow[];
    }, [allHolidays, filters, showReport]);
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
                <HolidayReportFiltersComponent
                    filters={filters}
                    calendarYears={calendarYears}
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
                        <GenericDataTable
                            isLoading={false}
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
