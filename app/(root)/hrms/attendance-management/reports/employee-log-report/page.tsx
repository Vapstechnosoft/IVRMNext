'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { useMemo, useState } from 'react';
import { LogReportFilters, type LogReportFiltersState } from './_components/filters';
import { logReportColumns, type LogRow } from './_components/columns';

export default function EmployeeLogReportPage() {
    const db = createLocalCrud<LogRow & BaseEntity>('attendance:log');
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

    const data = useMemo(() => db.list(), []);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okType = filters.type && filters.type.length > 0 ? filters.type.includes(r.type) : true;
            const okDept = filters.department && filters.department.length > 0 ? filters.department.includes(r.department) : true;
            const okDesg = filters.designation && filters.designation.length > 0 ? filters.designation.includes(r.designation) : true;
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
                        title='Employee Log Report'
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable isLoading={false} columns={logReportColumns} data={filtered} totalItems={filtered.length} showViewOptions />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
