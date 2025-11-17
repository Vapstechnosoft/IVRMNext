'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface MissingLog {
    id: number;
    employeeName: string;
    date: string;
    time: string;
    inOut: 'IN' | 'OUT';
    file?: string; // path/url placeholder
    remarks?: string;
    reportedBy?: string;
    status: 'Pending' | 'Approved' | 'Rejected';

    createdAt: Date;
}

export const getMissingLogColumns = (): ColumnDef<MissingLog>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />
    },
    {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />
    },
    {
        accessorKey: 'time',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Time' />
    },
    {
        accessorKey: 'inOut',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Input/Output' />,
        cell: ({ row }) => {
            const value = row.getValue('inOut') as string;
            return <div>{value === 'IN' ? '0' : '1'}</div>;
        }
    },
    {
        accessorKey: 'file',
        header: ({ column }) => <DataTableColumnHeader column={column} title='File' />,
        cell: ({ row }) => {
            const file = row.getValue('file') as string | undefined;
            return file ? (
                <Button variant='link' size='sm' className='h-auto p-0 text-destructive hover:text-destructive/80'>
                    view
                </Button>
            ) : (
                <span className='text-muted-foreground'>-</span>
            );
        }
    },
    {
        accessorKey: 'remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />
    },
    {
        accessorKey: 'reportedBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reported By' />
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />
    }
];
