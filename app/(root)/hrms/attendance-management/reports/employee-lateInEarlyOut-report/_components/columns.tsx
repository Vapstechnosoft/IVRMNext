'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';

export interface LIEORow extends BaseEntity {
    type: string;
    department: string;
    designation: string;
    employeeCode: string;
    employeeName: string;
    date: string;
    lateBy?: string; // mm:ss
    earlyOut?: string; // mm:ss
}

export const employeeLateInEarlyOutReportColumns: ColumnDef<LIEORow>[] = [
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
