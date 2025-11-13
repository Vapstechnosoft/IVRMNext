'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';

export interface InOutRow extends BaseEntity {
    branch: string;
    type: string;
    department: string;
    designation: string;
    employeeCode: string;
    employeeName: string;
    date: string;
    timeIn?: string;
    timeOut?: string;
}

export const employeeInOutReportColumns: ColumnDef<InOutRow>[] = [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    { accessorKey: 'employeeName', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' /> },
    { accessorKey: 'employeeCode', header: ({ column }) => <DataTableColumnHeader column={column} title='Code' /> },
    { accessorKey: 'date', header: ({ column }) => <DataTableColumnHeader column={column} title='Date' /> },
    { accessorKey: 'timeIn', header: ({ column }) => <DataTableColumnHeader column={column} title='Time In' /> },
    { accessorKey: 'timeOut', header: ({ column }) => <DataTableColumnHeader column={column} title='Time Out' /> },
    { accessorKey: 'branch', header: ({ column }) => <DataTableColumnHeader column={column} title='Branch' /> },
    { accessorKey: 'department', header: ({ column }) => <DataTableColumnHeader column={column} title='Department' /> },
    { accessorKey: 'designation', header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' /> }
];
