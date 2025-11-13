'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface EmployeeStrengthRecord {
    id?: number;
    createdAt?: string;
    departmentName: string;
    designationName: string;
    groupType: string;
    totalEmployees: number;
    activeEmployees: number;
    leftEmployees: number;
    newJoinees: number;
    maleEmployees: number;
    femaleEmployees: number;
    dateRange: string;
}

export const employeeStrengthColumns: ColumnDef<EmployeeStrengthRecord>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false,
        size: 80
    },
    {
        accessorKey: 'departmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('departmentName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'designationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div>{row.getValue('designationName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'groupType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type' />,
        cell: ({ row }) => <div>{row.getValue('groupType')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'totalEmployees',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
        cell: ({ row }) => <div className='font-semibold'>{row.getValue('totalEmployees')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'activeEmployees',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
        cell: ({ row }) => <div className='font-medium text-green-600'>{row.getValue('activeEmployees')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'leftEmployees',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Left' />,
        cell: ({ row }) => <div className='font-medium text-red-600'>{row.getValue('leftEmployees')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'newJoinees',
        header: ({ column }) => <DataTableColumnHeader column={column} title='New Joinees' />,
        cell: ({ row }) => <div className='font-medium text-blue-600'>{row.getValue('newJoinees')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'maleEmployees',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Male' />,
        cell: ({ row }) => <div>{row.getValue('maleEmployees')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'femaleEmployees',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Female' />,
        cell: ({ row }) => <div>{row.getValue('femaleEmployees')}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
