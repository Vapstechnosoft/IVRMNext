'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { SalaryAdvanceItem } from '@/types/hrms/salary-advance';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ActionsCell } from './actions-cell';

export const salaryAdvanceColumns: ColumnDef<SalaryAdvanceItem>[] = [
    {
        accessorKey: 'HRME_EmployeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.HRME_EmployeeCode}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => {
            const fullName = [row.original.HRME_EmployeeFirstName, row.original.HRME_EmployeeMiddleName, row.original.HRME_EmployeeLastName]
                .filter(Boolean)
                .join(' ');
            return <div className='font-medium'>{fullName}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRESA_AdvYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Year' />,
        cell: ({ row }) => <div>{row.original.HRESA_AdvYear}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HRESA_AdvMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Month' />,
        cell: ({ row }) => <div>{row.original.HRESA_AdvMonth}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HRESA_AppliedAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Amount' />,
        cell: ({ row }) => <div className='text-right font-medium'>₹{row.original.HRESA_AppliedAmount.toFixed(2)}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HRESA_SanctinedAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sanctioned Amount' />,
        cell: ({ row }) => <div className='text-right font-medium'>₹{row.original.HRESA_SanctinedAmount.toFixed(2)}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HRESA_AdvStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = row.getValue('HRESA_AdvStatus') as string;
            const variant = status === 'Approved' ? 'default' : status === 'Pending' ? 'secondary' : 'destructive';
            return (
                <Badge variant={variant} className='font-medium'>
                    {status}
                </Badge>
            );
        },
        enableSorting: true,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        }
    },
    {
        accessorKey: 'HRESA_EntryDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Entry Date' />,
        cell: ({ row }) => {
            const date = row.original.HRESA_EntryDate;
            return <div>{date ? format(new Date(date), 'dd MMM yyyy') : '-'}</div>;
        },
        enableSorting: true
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionsCell row={row} />
    }
];
