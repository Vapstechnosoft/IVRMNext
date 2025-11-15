'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { SalaryIncrementGridItem } from '@/types/hrms/salary-increment';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionsCell } from './actions-cell';

export const salaryIncrementColumns: ColumnDef<SalaryIncrementGridItem>[] = [
    {
        accessorKey: 'EmployeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.EmployeeName || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HRMD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.original.HRMD_DepartmentName || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HRMED_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Earning/Deduction Head' />,
        cell: ({ row }) => <div>{row.original.HRMED_Name || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => <div className='text-right font-medium'>₹{row.original.Amount.toFixed(2)}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'Flag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
        cell: ({ row }) => <div>{row.original.Flag || '-'}</div>,
        enableSorting: true
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionsCell row={row} />
    }
];
