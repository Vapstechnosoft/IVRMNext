'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';

export interface EmployeeAbsentReportRow extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    designation: string;
    totalAbsent: number;
}

export const employeeAbsentReportColumns: ColumnDef<EmployeeAbsentReportRow>[] = [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'employeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />
    },
    {
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />
    },
    {
        accessorKey: 'totalAbsent',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Absent' />
    }
];

