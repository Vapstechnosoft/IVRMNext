'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useMemo, useState } from 'react';
import { type LIEORow, employeeLateInEarlyOutReportColumns } from './_components/columns';
import {
    type EmployeeLateInEarlyOutReportFilters,
    EmployeeLateInEarlyOutReportFilters as EmployeeLateInEarlyOutReportFiltersComponent
} from './_components/filters';

export default function EmployeeLateInEarlyOutReportPage() {
    const db = createLocalCrud<LIEORow>('attendance:lieo');
    const [showReport, setShowReport] = useState(false);
    const [selectedRows, setSelectedRows] = useState<LIEORow[]>([]);
    const [filters, setFilters] = useState<EmployeeLateInEarlyOutReportFilters>({
        type: [],
        department: [],
        designation: [],
        allOrIndividual: 'All',
        codeOrName: 'Code',
        query: '',
        fromDate: '',
        toDate: '',
        mode: 'Late By'
    });

    const data = useMemo(() => db.list(), []);

    const types = useMemo(() => [...new Set(data.map((d) => d.type).filter(Boolean))], [data]);
    const departments = useMemo(() => [...new Set(data.map((d) => d.department))], [data]);
    const designations = useMemo(() => [...new Set(data.map((d) => d.designation))], [data]);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okType = filters.type && filters.type.length > 0 ? filters.type.includes(r.type) : true;
            const okDept = filters.department && filters.department.length > 0 ? filters.department.includes(r.department) : true;
            const okDesg = filters.designation && filters.designation.length > 0 ? filters.designation.includes(r.designation) : true;
            const okDateFrom = filters.fromDate ? new Date(r.date) >= new Date(filters.fromDate) : true;
            const okDateTo = filters.toDate ? new Date(r.date) <= new Date(filters.toDate) : true;
            const okQuery =
                filters.allOrIndividual === 'Individual' && filters.query
                    ? filters.codeOrName === 'Code'
                        ? r.employeeCode.includes(filters.query)
                        : r.employeeName.toLowerCase().includes(filters.query.toLowerCase())
                    : true;
            const okMode =
                filters.mode === 'Late By' ? r.lateBy : filters.mode === 'Early Out' ? r.earlyOut : r.lateBy || r.earlyOut;
            return okType && okDept && okDesg && okDateFrom && okDateTo && okQuery && okMode;
        });
    }, [data, filters]);

    const handleSearch = () => {
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
            fromDate: '',
            toDate: '',
            mode: 'Late By'
        });
        setShowReport(false);
        setSelectedRows([]);
    };

    const handleExport = () => {
        /* TODO: implement export functionality */
        console.log('Exporting selected rows:', selectedRows);
    };

    const handleRowSelectionChange = (rows: LIEORow[]) => {
        setSelectedRows(rows);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <EmployeeLateInEarlyOutReportFiltersComponent
                    filters={filters}
                    departments={departments}
                    designations={designations}
                    types={types}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                    onExport={handleExport}
                    onPrint={() => window.print()}
                />

                {showReport && (
                    <CollapsibleSection
                        title='Grid View'
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable
                            isLoading={false}
                            columns={employeeLateInEarlyOutReportColumns}
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
