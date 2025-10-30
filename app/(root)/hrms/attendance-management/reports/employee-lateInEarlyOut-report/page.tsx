// Refactored by automation script on 2025-10-28T15:40:35.644Z
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { FileDown, Printer, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

interface LIEORow extends BaseEntity {
    type: string;
    department: string;
    designation: string;
    employeeCode: string;
    employeeName: string;
    date: string;
    lateBy?: string; // mm:ss
    earlyOut?: string; // mm:ss
}

export default function EmployeeLateInEarlyOutReportPage() {
    const db = createLocalCrud<LIEORow>('attendance:lieo');

    const [type, setType] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [designation, setDesignation] = useState<string>('');
    const [allOrIndividual, setAllOrIndividual] = useState<'All' | 'Individual'>('All');
    const [codeOrName, setCodeOrName] = useState<'Code' | 'Name'>('Code');
    const [query, setQuery] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [mode, setMode] = useState<'Late By' | 'Early Out' | 'Late In Early Out'>('Late In Early Out');

    const data = useMemo(() => db.list(), []);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okType = type ? r.type === type : true;
            const okDept = department ? r.department === department : true;
            const okDesg = designation ? r.designation === designation : true;
            const okDateFrom = fromDate ? new Date(r.date) >= new Date(fromDate) : true;
            const okDateTo = toDate ? new Date(r.date) <= new Date(toDate) : true;
            const okQuery =
                allOrIndividual === 'Individual' && query
                    ? codeOrName === 'Code'
                        ? r.employeeCode.includes(query)
                        : r.employeeName.toLowerCase().includes(query.toLowerCase())
                    : true;
            const okMode = mode === 'Late By' ? r.lateBy : mode === 'Early Out' ? r.earlyOut : r.lateBy || r.earlyOut;
            return okType && okDept && okDesg && okDateFrom && okDateTo && okQuery && okMode;
        });
    }, [data, type, department, designation, allOrIndividual, codeOrName, query, fromDate, toDate, mode]);

    const columns: ColumnDef<LIEORow>[] = [
        {
            id: 'sl',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        { accessorKey: 'employeeName', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' /> },
        { accessorKey: 'employeeCode', header: ({ column }) => <DataTableColumnHeader column={column} title='Code' /> },
        { accessorKey: 'department', header: ({ column }) => <DataTableColumnHeader column={column} title='Department' /> },
        { accessorKey: 'designation', header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' /> },
        { accessorKey: 'date', header: ({ column }) => <DataTableColumnHeader column={column} title='Date' /> },
        { accessorKey: 'lateBy', header: ({ column }) => <DataTableColumnHeader column={column} title='Late By' /> },
        { accessorKey: 'earlyOut', header: ({ column }) => <DataTableColumnHeader column={column} title='Early Out' /> }
    ];

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
                        <Heading title='Employee LateIn EarlyOut Report' description='' />
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
                        <div className='md:col-span-4'>
                            <label className='font-medium text-sm' htmlFor='type'>
                                Type
                            </label>
                            <Select onValueChange={setType}>
                                <SelectTrigger id='type'>
                                    <SelectValue placeholder='Type' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Permanent'>Permanent</SelectItem>
                                    <SelectItem value='Contract'>Contract</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='md:col-span-4'>
                            <label className='font-medium text-sm' htmlFor='department'>
                                Department
                            </label>
                            <Select onValueChange={setDepartment}>
                                <SelectTrigger id='department'>
                                    <SelectValue placeholder='Department' />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...new Set(data.map((d) => d.department))].map((v) => (
                                        <SelectItem key={v} value={v}>
                                            {v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='md:col-span-4'>
                            <label className='font-medium text-sm' htmlFor='designation'>
                                Designation
                            </label>
                            <Select onValueChange={setDesignation}>
                                <SelectTrigger id='designation'>
                                    <SelectValue placeholder='Designation' />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...new Set(data.map((d) => d.designation))].map((v) => (
                                        <SelectItem key={v} value={v}>
                                            {v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='flex items-center gap-4 pt-2 md:col-span-12'>
                            <div className='flex items-center gap-2 text-sm'>
                                <Checkbox checked={allOrIndividual === 'All'} onCheckedChange={() => setAllOrIndividual('All')} />
                                <span>All</span>
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                <Checkbox
                                    checked={allOrIndividual === 'Individual'}
                                    onCheckedChange={() => setAllOrIndividual('Individual')}
                                />
                                <span>Individual</span>
                            </div>
                            <div className='flex items-center gap-4'>
                                <div className='flex items-center gap-2 text-sm'>
                                    <Checkbox checked={codeOrName === 'Code'} onCheckedChange={() => setCodeOrName('Code')} />
                                    <span>Code</span>
                                </div>
                                <div className='flex items-center gap-2 text-sm'>
                                    <Checkbox checked={codeOrName === 'Name'} onCheckedChange={() => setCodeOrName('Name')} />
                                    <span>Name</span>
                                </div>
                                <InputText
                                    placeholder={codeOrName === 'Code' ? 'Code' : 'Name'}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className='md:col-span-3'>
                            <label className='font-medium text-sm' htmlFor='fromDate'>
                                From Date
                            </label>
                            <InputText id='fromDate' type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div className='md:col-span-3'>
                            <label className='font-medium text-sm' htmlFor='toDate'>
                                To Date
                            </label>
                            <InputText id='toDate' type='date' value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                        <div className='md:col-span-3'>
                            <label className='font-medium text-sm' htmlFor='mode'>
                                Mode
                            </label>
                            <Select onValueChange={(v) => setMode(v as any)}>
                                <SelectTrigger id='mode'>
                                    <SelectValue placeholder='Mode' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Late By'>Late By</SelectItem>
                                    <SelectItem value='Early Out'>Early Out</SelectItem>
                                    <SelectItem value='Late In Early Out'>Late In Early Out</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='flex items-end gap-2 md:col-span-3'>
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
