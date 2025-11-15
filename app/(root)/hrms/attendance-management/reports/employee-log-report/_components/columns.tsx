'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import type { BaseEntity } from '@/lib/localdb';

export interface LogRow extends BaseEntity {
    type: string;
    department: string;
    designation: string;
    employeeCode: string;
    employeeName: string;
    date: string;
    punchTime?: string;
    lateIn?: string;
    earlyOut?: string;
}

export const logReportColumns: ColumnDef<LogRow>[] = [
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
        accessorKey: 'employeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />
    },
    {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />
    },
    {
        accessorKey: 'punchTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Punch Time' />
    },
    {
        accessorKey: 'lateIn',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Late In' />
    },
    {
        accessorKey: 'earlyOut',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Early Out' />
    },
    {
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />
    },
    {
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />
    }
];
