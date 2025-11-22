'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IMasterFeesInstallmentDueDateList } from '@/types/fees/masters';
import type { ColumnDef } from '@tanstack/react-table';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

function CalendarCell({
    row,
    field
}: {
    row: any;
    field: keyof IMasterFeesInstallmentDueDateList;
}) {
    const value = row.getValue(field);
    const initialDate = value ? new Date(value) : undefined;

    const [date, setDate] = useState<Date | undefined>(initialDate);

    const handleSelect = (d: Date | undefined) => {
        setDate(d);
        row.original[field] = d ? d.toISOString() : null;
    };

    return (
        <Popover>
            <PopoverTrigger className='flex cursor-pointer items-center gap-2'>
                <CalendarIcon className='h-4 w-4 text-gray-500' />
                <span>{date ? date.toLocaleDateString() : '-'}</span>
            </PopoverTrigger>

            <PopoverContent className='p-0'>
                <Calendar mode='single' selected={date} onSelect={handleSelect} />
            </PopoverContent>
        </Popover>
    );
}

export const masterFeeInstallmentDueDateColumn: ColumnDef<IMasterFeesInstallmentDueDateList>[] = [
    {
        accessorKey: 'ftidD_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL NO' />,
        cell: ({ row }) => <div>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false
    },

    {
        accessorKey: 'ftI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment Name' />,
        cell: ({ row }) => <div>{row.getValue('ftI_Name')}</div>
    },

    {
        accessorKey: 'fdate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment From Date' />,
        cell: ({ row }) => <CalendarCell row={row} field='fdate' />
    },

    {
        accessorKey: 'tdate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment To Date' />,
        cell: ({ row }) => <CalendarCell row={row} field='tdate' />
    },

    {
        accessorKey: 'aplc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment Applicable' />,
        cell: ({ row }) => <CalendarCell row={row} field='aplc' />
    },

    {
        accessorKey: 'ddate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment Due Date' />,
        cell: ({ row }) => <CalendarCell row={row} field='ddate' />
    }
];

// function formatDate(dateString: string) {
//     if (!dateString || dateString === '0001-01-01T00:00:00') return '-';
//     return new Date(dateString).toLocaleDateString();
// }
