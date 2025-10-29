'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { EmployeeLoanItem } from '@/types/hrms/employee-loan';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ActionsCell } from './actions-cell';

export const employeeLoanColumns: ColumnDef<EmployeeLoanItem>[] = [
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
        accessorKey: 'HRML_LoanType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Type' />,
        cell: ({ row }) => <div>{row.original.HRML_LoanType || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HREL_AppliedDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Date' />,
        cell: ({ row }) => {
            const date = row.original.HREL_AppliedDate;
            return <div>{date ? format(new Date(date), 'dd MMM yyyy') : '-'}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HREL_LoanAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Amount' />,
        cell: ({ row }) => <div className='text-right font-medium'>₹{row.original.HREL_LoanAmount.toFixed(2)}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HREL_SanctionedAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sanctioned Amount' />,
        cell: ({ row }) => <div className='text-right font-medium'>₹{row.original.HREL_SanctionedAmount.toFixed(2)}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HREL_LoanInsallments',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installments' />,
        cell: ({ row }) => <div className='text-center'>{row.original.HREL_LoanInsallments}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HREL_LaonEMI',
        header: ({ column }) => <DataTableColumnHeader column={column} title='EMI' />,
        cell: ({ row }) => <div className='text-right font-medium'>₹{row.original.HREL_LaonEMI.toFixed(2)}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HREL_TotalPending',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Pending Amount' />,
        cell: ({ row }) => <div className='text-right font-medium'>₹{row.original.HREL_TotalPending.toFixed(2)}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'HREL_LoanStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = row.getValue('HREL_LoanStatus') as string;
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
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionsCell row={row} />
    }
];
