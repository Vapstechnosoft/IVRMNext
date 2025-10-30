// Refactored by automation script on 2025-10-28T15:40:35.670Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/filters.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { FileDown, Printer, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

interface YearRow extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    designation: string;
    dateOfJoining: string;
    january: number;
    totalPresent: number;
    totalWorkedOnHolidays: number;
}

export default function EmployeeYearlyReportPage() {
    const db = createLocalCrud<YearRow>('attendance:year');

    const [_type, _setType] = useState<string>('');
    const [_department, _setDepartment] = useState<string>('');
    const [_designation, _setDesignation] = useState<string>('');
    const [allOrIndividual, setAllOrIndividual] = useState<'All' | 'Individual'>('All');
    const [employee, setEmployee] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');

    const data = useMemo(() => db.list(), []);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okEmp = allOrIndividual === 'Individual' && employee ? r.employeeName === employee : true;
            const okDateFrom = fromDate ? new Date(r.dateOfJoining) >= new Date(fromDate) : true;
            const okDateTo = toDate ? new Date(r.dateOfJoining) <= new Date(toDate) : true;
            return okEmp && okDateFrom && okDateTo;
        });
    }, [data, allOrIndividual, employee, fromDate, toDate]);

    const columns: ColumnDef<YearRow>[] = [
        {
            id: 'sl',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        { accessorKey: 'employeeCode', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' /> },
        { accessorKey: 'employeeName', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' /> },
        { accessorKey: 'designation', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Designation' /> },
        { accessorKey: 'dateOfJoining', header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Joining' /> },
        { accessorKey: 'january', header: ({ column }) => <DataTableColumnHeader column={column} title='January 2023' /> },
        { accessorKey: 'totalPresent', header: ({ column }) => <DataTableColumnHeader column={column} title='Total Present' /> },
        {
            accessorKey: 'totalWorkedOnHolidays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Worked on Holidays' />
        }
    ];

    const handleReport = () => {
        // TODO: Implement report generation
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
                        <Heading title='Employee Yearly Report' description='' />
                    </div>
                </div>

                <CollapsibleSection
                    title=''
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                        <div className='flex items-center gap-4 md:col-span-12'>
                            <div className='flex items-center gap-2 text-sm'>
                                <Checkbox
                                    id='all-checkbox'
                                    checked={allOrIndividual === 'All'}
                                    onCheckedChange={() => setAllOrIndividual('All')}
                                />
                                <Label htmlFor='all-checkbox'>All</Label>
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                <Checkbox
                                    id='individual-checkbox'
                                    checked={allOrIndividual === 'Individual'}
                                    onCheckedChange={() => setAllOrIndividual('Individual')}
                                />
                                <Label htmlFor='individual-checkbox'>Individual</Label>
                            </div>
                        </div>
                        <div className='md:col-span-6'>
                            <label htmlFor='employee-select' className='font-medium text-sm'>
                                Employee
                            </label>
                            <Select onValueChange={setEmployee}>
                                <SelectTrigger id='employee-select'>
                                    <SelectValue placeholder='Select or Search Employee in list' />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...new Set(data.map((d) => d.employeeName))].map((n) => (
                                        <SelectItem key={n} value={n}>
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='md:col-span-3'>
                            <label htmlFor='from-date-input' className='font-medium text-sm'>
                                From Date
                            </label>
                            <InputText id='from-date-input' type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div className='md:col-span-3'>
                            <label htmlFor='to-date-input' className='font-medium text-sm'>
                                To Date
                            </label>
                            <InputText id='to-date-input' type='date' value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                        <div className='flex gap-2 md:col-span-12'>
                            <Button onClick={handleReport}>
                                <RefreshCw className='mr-2 h-4 w-4' /> Report
                            </Button>
                            <Button variant='outline' onClick={handleExport}>
                                <FileDown className='mr-2 h-4 w-4' /> Export to Excel
                            </Button>
                            <Button variant='outline' onClick={handlePrint}>
                                <Printer className='mr-2 h-4 w-4' /> Print
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title='Grid View'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable isLoading={false} columns={columns} data={filtered} totalItems={filtered.length} showViewOptions />
                </CollapsibleSection>
            </div>
        </div>
    );
}
