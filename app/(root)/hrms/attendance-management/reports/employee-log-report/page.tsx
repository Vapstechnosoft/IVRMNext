'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { useMemo, useState } from 'react';
import { LogReportFilters, type LogReportFiltersState } from './_components/filters';
import { logReportColumns, type LogRow } from './_components/columns';

export default function EmployeeLogReportPage() {
    const db = createLocalCrud<LogRow & BaseEntity>('attendance:log');

    const [filters, setFilters] = useState<LogReportFiltersState>({
        type: '',
        department: '',
        designation: '',
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

    const data = useMemo(() => db.list(), []);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okType = filters.type ? r.type === filters.type : true;
            const okDept = filters.department ? r.department === filters.department : true;
            const okDesg = filters.designation ? r.designation === filters.designation : true;
            const okQuery =
                filters.allOrIndividual === 'Individual' && filters.query
                    ? filters.codeOrName === 'Code'
                        ? r.employeeCode.includes(filters.query)
                        : r.employeeName.toLowerCase().includes(filters.query.toLowerCase())
                    : true;
            const okDate =
                filters.dateMode === 'Date'
                    ? filters.date
                        ? r.date === filters.date
                        : true
                    : filters.dateMode === 'Monthly'
                      ? filters.month
                          ? r.date.startsWith(filters.month)
                          : true
                      : (filters.fromDate ? new Date(r.date) >= new Date(filters.fromDate) : true) &&
                        (filters.toDate ? new Date(r.date) <= new Date(filters.toDate) : true);
            const okMetric =
                filters.metric === 'Punch Time' ? r.punchTime : filters.metric === 'Late In' ? r.lateIn : r.earlyOut;
            return okType && okDept && okDesg && okQuery && okDate && okMetric;
        });
    }, [data, filters]);

    const handleReport = () => {
        /* TODO: implement */
    };
    const handleExport = () => {
        /* TODO: implement */
    };
    const handlePrint = () => window.print();

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Employee Log Report' description='' />
                    </div>
                </div>

                <LogReportFilters
                    filters={filters}
                    data={data}
                    onFilterChange={setFilters}
                    onReport={handleReport}
                    onExport={handleExport}
                    onPrint={handlePrint}
                />

                <CollapsibleSection
                    title='Employee Log Report'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable isLoading={false} columns={logReportColumns} data={filtered} totalItems={filtered.length} showViewOptions />
                </CollapsibleSection>
            </div>
        </div>
    );
}
