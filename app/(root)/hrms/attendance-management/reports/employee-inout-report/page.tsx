'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useMemo, useState } from 'react';
import { type InOutRow, employeeInOutReportColumns } from './_components/columns';
import {
    type EmployeeInOutReportFilters,
    EmployeeInOutReportFilters as EmployeeInOutReportFiltersComponent
} from './_components/filters';

export default function EmployeeInOutReportPage() {
    const db = createLocalCrud<InOutRow>('attendance:inout');
    const [showReport, setShowReport] = useState(false);
    const [selectedRows, setSelectedRows] = useState<InOutRow[]>([]);
    const [filters, setFilters] = useState<EmployeeInOutReportFilters>({
        branch: '',
        type: [],
        department: [],
        designation: [],
        allOrIndividual: 'All',
        codeOrName: 'Code',
        query: '',
        fromDate: '',
        toDate: '',
        timeInTimeOut: undefined
    });

    const data = useMemo(() => db.list(), []);

    const branches = useMemo(() => [...new Set(data.map((d) => d.branch))], [data]);
    const departments = useMemo(() => [...new Set(data.map((d) => d.department))], [data]);
    const designations = useMemo(() => [...new Set(data.map((d) => d.designation))], [data]);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okBranch = filters.branch ? r.branch === filters.branch : true;
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
            const okTimeInOut = filters.timeInTimeOut ? (filters.timeInTimeOut === 'Time In' ? r.timeIn : r.timeOut) : true;
            return okBranch && okType && okDept && okDesg && okDateFrom && okDateTo && okQuery && okTimeInOut;
        });
    }, [data, filters]);

    const handleSearch = () => {
        setShowReport(true);
    };

    const handleCancel = () => {
        setFilters({
            branch: '',
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            codeOrName: 'Code',
            query: '',
            fromDate: '',
            toDate: '',
            timeInTimeOut: undefined
        });
        setShowReport(false);
        setSelectedRows([]);
    };

    const handleExport = () => {
        /* TODO: implement export functionality */
        console.log('Exporting selected rows:', selectedRows);
    };

    const handleRowSelectionChange = (rows: InOutRow[]) => {
        setSelectedRows(rows);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <EmployeeInOutReportFiltersComponent
                    filters={filters}
                    branches={[]}
                    departments={departments}
                    designations={designations}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                    onExport={handleExport}
                    onPrint={() => window.print()}
                />

                {showReport && (
                    <CollapsibleSection
                        title='Employee In/Out Report'
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable
                            isLoading={false}
                            columns={employeeInOutReportColumns}
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
