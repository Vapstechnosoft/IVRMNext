'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { createLocalCrud } from '@/lib/localdb';
import { useMemo, useState } from 'react';
import { type EmployeeAbsentReportRow, employeeAbsentReportColumns } from './_components/columns';
import {
    type EmployeeAbsentReportFilters,
    EmployeeAbsentReportFilters as EmployeeAbsentReportFiltersComponent
} from './_components/filters';
import type { InOutRow } from '../employee-inout-report/_components/columns';

export default function EmployeeAbsentReportPage() {
    const db = createLocalCrud<InOutRow>('attendance:inout');
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<EmployeeAbsentReportFilters>({
        type: [],
        department: [],
        designation: [],
        allOrIndividual: 'All',
        employee: '',
        fromDate: '',
        toDate: ''
    });

    const data = useMemo(() => db.list(), []);

    // Extract unique values for dropdowns
    const types = useMemo(() => [...new Set(data.map((d) => d.type).filter(Boolean))], [data]);
    const departments = useMemo(() => [...new Set(data.map((d) => d.department).filter(Boolean))], [data]);
    const designations = useMemo(() => [...new Set(data.map((d) => d.designation).filter(Boolean))], [data]);
    const employees = useMemo(() => [...new Set(data.map((d) => d.employeeName).filter(Boolean))], [data]);

    // Calculate absent days - this is a mock calculation
    // In real scenario, you'd compare attendance records with expected working days
    const filtered = useMemo(() => {
        if (!showReport) return [];

        // Group by employee and calculate absent days
        const employeeMap = new Map<string, EmployeeAbsentReportRow>();

        data.forEach((record) => {
            // Filter by type
            const okType = filters.type.length === 0 || filters.type.includes(record.type);
            // Filter by department
            const okDept = filters.department.length === 0 || filters.department.includes(record.department);
            // Filter by designation
            const okDesg = filters.designation.length === 0 || filters.designation.includes(record.designation);
            // Filter by date range
            const okDateFrom = filters.fromDate ? new Date(record.date) >= new Date(filters.fromDate) : true;
            const okDateTo = filters.toDate ? new Date(record.date) <= new Date(filters.toDate) : true;
            // Filter by employee if Individual is selected
            const okEmp =
                filters.allOrIndividual === 'All' ||
                (filters.allOrIndividual === 'Individual' && filters.employee
                    ? record.employeeName === filters.employee
                    : false);

            if (okType && okDept && okDesg && okDateFrom && okDateTo && okEmp) {
                const key = `${record.employeeCode}-${record.employeeName}`;
                if (!employeeMap.has(key)) {
                    employeeMap.set(key, {
                        id: record.id,
                        createdAt: record.createdAt,
                        employeeCode: record.employeeCode,
                        employeeName: record.employeeName,
                        designation: record.designation,
                        totalAbsent: 0
                    });
                }
            }
        });

        // For this mock, we'll assume absence is when there's no attendance record
        // In a real scenario, you'd need to compare with expected working days
        const result = Array.from(employeeMap.values()).map((emp) => ({
            ...emp,
            totalAbsent: 1 // Mock value - in real scenario calculate actual absent days
        }));

        return result;
    }, [data, filters, showReport]);

    const handleSearch = () => {
        // Validate required fields
        if (filters.type.length === 0 || filters.department.length === 0 || filters.designation.length === 0) {
            return;
        }
        if (!filters.fromDate || !filters.toDate) {
            return;
        }
        if (filters.allOrIndividual === 'Individual' && !filters.employee) {
            return;
        }
        setShowReport(true);
    };

    const handleCancel = () => {
        setFilters({
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employee: '',
            fromDate: '',
            toDate: ''
        });
        setShowReport(false);
    };

    const handleExport = () => {
        /* TODO: implement */
    };

    const handlePrint = () => window.print();

    const reportTitle = showReport && filters.fromDate && filters.toDate
        ? `Monthly Report from ${new Date(filters.fromDate).toLocaleDateString('en-GB')} to ${new Date(filters.toDate).toLocaleDateString('en-GB')}`
        : 'GRID VIEW';

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Employee Absent Detail Report' description='' />
                    </div>
                </div>

                <EmployeeAbsentReportFiltersComponent
                    filters={filters}
                    types={types}
                    departments={departments}
                    designations={designations}
                    employees={employees}
                    onFilterChange={setFilters}
                    onSearch={handleSearch}
                    onCancel={handleCancel}
                    onExport={handleExport}
                    onPrint={handlePrint}
                />

                {showReport && (
                    <CollapsibleSection
                        title={reportTitle}
                        description=''
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable
                            isLoading={false}
                            columns={employeeAbsentReportColumns}
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

