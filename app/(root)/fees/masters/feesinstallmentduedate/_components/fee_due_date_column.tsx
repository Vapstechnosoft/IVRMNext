'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IMasterFeesInstallmentDueDateList } from '@/types/fees/masters';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

function CalendarCell({
    row,
    field
}: {
    row: any;
    field: keyof IMasterFeesInstallmentDueDateList;
}) {
    const rawValue = row.getValue(field);
    const currentDate = rawValue && rawValue !== '0001-01-01T00:00:00' ? new Date(rawValue as string) : undefined;

    const [date, setDate] = useState<Date | undefined>(currentDate);

    // Re-render when row data changes (fdate/tdate update)
    useEffect(() => {
        setDate(currentDate);
    }, [currentDate, row.original.fdate, row.original.tdate]);

    const getDate = (key: keyof IMasterFeesInstallmentDueDateList): Date | null => {
        const val = row.original[key];
        if (!val || val === '0001-01-01T00:00:00') return null;
        const d = new Date(val as string);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    const fromDate = getDate('fdate');
    const toDate = getDate('tdate');

    let fromDateProp: Date | undefined;
    let toDateProp: Date | undefined;
    let defaultMonth: Date = date ?? new Date();

    if (field === 'tdate' && fromDate) {
        fromDateProp = new Date(fromDate);
        fromDateProp.setDate(fromDate.getDate() + 1);
        defaultMonth = fromDateProp;
    }

    if (field === 'aplc' && fromDate) {
        fromDateProp = fromDate;
        toDateProp = toDate ?? new Date(); // limit to today if tdate not set
        defaultMonth = fromDate;
    }

    if (field === 'ddate' && fromDate) {
        // Strictly after fromDate
        fromDateProp = new Date(fromDate);
        fromDateProp.setDate(fromDate.getDate() + 1);
        defaultMonth = fromDateProp;
    }

    const handleSelect = (selected: Date | undefined) => {
        if (!selected) {
            setDate(undefined);
            row.original[field] = null;
            return;
        }

        // Enforce ranges
        if (field === 'tdate' && fromDate && selected <= fromDate) return;
        if (field === 'ddate' && fromDate && selected <= fromDate) return; // strictly after fromDate
        if (field === 'aplc' && fromDate) {
            const maxDate = toDate ?? new Date();
            if (selected < fromDate || selected > maxDate) return;
        }

        selected.setHours(0, 0, 0, 0);
        setDate(selected);
        row.original[field] = selected.toISOString();
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='ghost' className={cn('h-9 w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? format(date, 'dd/MM/yyyy') : <span>Pick date</span>}
                </Button>
            </PopoverTrigger>

            <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                    mode='single'
                    selected={date}
                    onSelect={handleSelect}
                    fromDate={fromDateProp}
                    toDate={toDateProp}
                    defaultMonth={defaultMonth}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}

// --- Column definitions ---
export const masterFeeInstallmentDueDateColumn: ColumnDef<IMasterFeesInstallmentDueDateList>[] = [
    {
        accessorKey: 'ftidD_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL NO' />,
        cell: ({ row }) => <div className='text-center font-medium'>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ftI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('ftI_Name')}</div>
    },
    {
        accessorKey: 'fdate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => <CalendarCell row={row} field='fdate' />
    },
    {
        accessorKey: 'tdate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => <CalendarCell row={row} field='tdate' />
    },
    {
        accessorKey: 'aplc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Applicable Date' />,
        cell: ({ row }) => <CalendarCell row={row} field='aplc' />
    },
    {
        accessorKey: 'ddate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Due Date' />,
        cell: ({ row }) => <CalendarCell row={row} field='ddate' />
    }
];
