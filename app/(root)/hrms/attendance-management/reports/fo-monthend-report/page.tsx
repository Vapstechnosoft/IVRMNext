'use client';

import { Heading } from '@/components/layout/heading';
import { useState } from 'react';
import { type FOMonthEndReportFilters, FOMonthEndReportFilters as FOMonthEndReportFiltersComponent } from './_components/filters';

export default function FOMonthEndReportPage() {
    const [filters, setFilters] = useState<FOMonthEndReportFilters>({
        mode: 'Month Wise',
        year: '2023',
        month: '01',
        date: ''
    });

    const handleSearch = () => {
        // TODO: Implement report generation
    };

    const handleCancel = () => {
        setFilters({
            mode: 'Month Wise',
            year: '2023',
            month: '01',
            date: ''
        });
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Attendance Report' description='' />
                    </div>
                </div>

                <FOMonthEndReportFiltersComponent
                    filters={filters}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
