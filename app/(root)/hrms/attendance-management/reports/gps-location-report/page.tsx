// Refactored by automation script on 2025-10-28T15:40:35.680Z
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

interface GPSLog extends BaseEntity {
    employeeName: string;
    clientName: string;
    leadName: string;
    gpsDate: string; // date-time
    address: string;
    remarks?: string;
}

export default function GPSLocationReportPage() {
    const db = createLocalCrud<GPSLog>('attendance:gps-location-attendance'); // reuse same storage
    const [betweenDates, setBetweenDates] = useState<boolean>(false);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [employee, setEmployee] = useState<string>('');

    const data = useMemo(() => db.list(), []);

    const filtered = useMemo(() => {
        return data.filter((r) => {
            const okEmp = employee ? r.employeeName === employee : true;
            const okFrom = betweenDates && fromDate ? new Date(r.gpsDate) >= new Date(fromDate) : true;
            const okTo = betweenDates && toDate ? new Date(r.gpsDate) <= new Date(toDate) : true;
            return okEmp && okFrom && okTo;
        });
    }, [data, employee, betweenDates, fromDate, toDate]);

    const columns: ColumnDef<GPSLog>[] = [
        {
            id: 'sl',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' />,
            cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
            enableSorting: false
        },
        { accessorKey: 'employeeName', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' /> },
        { accessorKey: 'clientName', header: ({ column }) => <DataTableColumnHeader column={column} title='Client Name' /> },
        { accessorKey: 'leadName', header: ({ column }) => <DataTableColumnHeader column={column} title='Lead Name' /> },
        { accessorKey: 'gpsDate', header: ({ column }) => <DataTableColumnHeader column={column} title='GPSL Date' /> },
        { accessorKey: 'address', header: ({ column }) => <DataTableColumnHeader column={column} title='Address' /> },
        { accessorKey: 'remarks', header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' /> }
    ];

    const handleReport = () => {};
    const handleExport = () => {};
    const handlePrint = () => window.print();

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Attendance GPS Location Report' description='' />
                    </div>
                </div>

                <CollapsibleSection
                    title=''
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-12'>
                        <div className='flex items-center gap-6 md:col-span-12'>
                            <label className='flex items-center gap-2 text-sm'>
                                <Checkbox checked={betweenDates} onCheckedChange={(v) => setBetweenDates(Boolean(v))} /> Between Date
                            </label>
                            <label className='flex items-center gap-2 text-sm'>
                                <Checkbox checked={!betweenDates} onCheckedChange={(v) => setBetweenDates(!v)} /> Employee Wise
                            </label>
                        </div>
                        <div className='md:col-span-4'>
                            <label className='font-medium text-sm'>From Date</label>
                            <InputText type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div className='md:col-span-4'>
                            <label className='font-medium text-sm'>To Date</label>
                            <InputText type='date' value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                        <div className='md:col-span-4'>
                            <label className='font-medium text-sm'>Employee Name</label>
                            <Select onValueChange={setEmployee}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Search Employee Name here...' />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...new Set(data.map((d) => d.employeeName))].map((name) => (
                                        <SelectItem key={name} value={name}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='flex gap-2 pt-2 md:col-span-12'>
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
                    title='Attendance GPS Location Report'
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
