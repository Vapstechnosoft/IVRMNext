'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';

export interface YearRow extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    designation: string;
    dateOfJoining: string;
    january: number;
    totalPresent: number;
    totalWorkedOnHolidays: number;
}

export const employeeYearlyReportColumns: ColumnDef<YearRow>[] = [
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
