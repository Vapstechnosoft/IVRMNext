'use client';

import { Heading } from '@/components/layout/heading';
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

    const [filters, setFilters] = useState<EmployeeInOutReportFilters>({
        branch: '',
        type: '',
        department: '',
        designation: '',
        allOrIndividual: 'All',
        codeOrName: 'Code',
        query: '',
        fromDate: '',
        toDate: ''
    });

    const data = useMemo(() => db.list(), []);

    const branches = useMemo(() => [...new Set(data.map((d) => d.branch))], [data]);
    const departments = useMemo(() => [...new Set(data.map((d) => d.department))], [data]);
    const designations = useMemo(() => [...new Set(data.map((d) => d.designation))], [data]);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okBranch = filters.branch ? r.branch === filters.branch : true;
            const okType = filters.type ? r.type === filters.type : true;
            const okDept = filters.department ? r.department === filters.department : true;
            const okDesg = filters.designation ? r.designation === filters.designation : true;
            const okDateFrom = filters.fromDate ? new Date(r.date) >= new Date(filters.fromDate) : true;
            const okDateTo = filters.toDate ? new Date(r.date) <= new Date(filters.toDate) : true;
            const okQuery =
                filters.allOrIndividual === 'Individual' && filters.query
                    ? filters.codeOrName === 'Code'
                        ? r.employeeCode.includes(filters.query)
                        : r.employeeName.toLowerCase().includes(filters.query.toLowerCase())
                    : true;
            return okBranch && okType && okDept && okDesg && okDateFrom && okDateTo && okQuery;
        });
    }, [data, filters]);

    const handleSearch = () => {
        /* TODO: implement */
    };

    const handleCancel = () => {
        setFilters({
            branch: '',
            type: '',
            department: '',
            designation: '',
            allOrIndividual: 'All',
            codeOrName: 'Code',
            query: '',
            fromDate: '',
            toDate: ''
        });
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
                        <Heading title='Employee In Out Report' description='' />
                    </div>
                </div>

                <EmployeeInOutReportFiltersComponent
                    filters={filters}
                    branches={branches}
                    departments={departments}
                    designations={designations}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                    onExport={handleExport}
                    onPrint={handlePrint}
                />

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
            </div>
        </div>
    );
}
