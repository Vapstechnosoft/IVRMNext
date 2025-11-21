'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BaseEntity } from '@/lib/localdb';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { CreditCard, Wallet } from 'lucide-react';

export interface GroupType extends BaseEntity {
    groupType: string;
    groupCode: string;
    order: number;
    isActive: boolean;
}

export interface Department extends BaseEntity {
    departmentName: string;
    internalTrainingHours: string;
    order: number;
    isActive: boolean;
}

export interface Designation extends BaseEntity {
    designationName: string;
    basicAmount: string;
    sanctionedSeats: string;
    displaySanctionedSeats: boolean;
    order: number;
    isActive: boolean;
}

// Bank cash report data structure
export interface BankCashRecord extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    groupType: string;
    departmentName: string;
    designationName: string;
    paymentMode: 'Bank' | 'Cash';
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    grossSalary: number;
    netSalary: number;
    deductions: number;
    month: string;
    year: string;
    paymentDate: string;
    paymentStatus: 'Paid' | 'Pending' | 'Failed';
}

// Table columns for Bank Cash Report
export const bankCashColumns: ColumnDef<BankCashRecord>[] = [
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
        accessorKey: 'employeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeCode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div>{row.getValue('employeeName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'departmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div className='text-sm'>{row.getValue('departmentName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'designationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div className='text-sm'>{row.getValue('designationName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'paymentMode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Payment Mode' />,
        cell: ({ row }) => {
            const mode = row.getValue('paymentMode') as string;
            return (
                <div
                    className={cn(
                        'inline-flex items-center rounded px-2 py-1 font-medium text-xs',
                        mode === 'Bank' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    )}>
                    {mode === 'Bank' ? <CreditCard className='mr-1 h-3 w-3' /> : <Wallet className='mr-1 h-3 w-3' />}
                    {mode}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'bankName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Bank Name' />,
        cell: ({ row }) => <div>{row.getValue('bankName') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'accountNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Account Number' />,
        cell: ({ row }) => <div className='font-mono text-sm'>{row.getValue('accountNumber') || '-'}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'grossSalary',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Salary' />,
        cell: ({ row }) => <div>₹{(row.getValue('grossSalary') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'deductions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Deductions' />,
        cell: ({ row }) => <div className='text-red-600'>₹{(row.getValue('deductions') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'netSalary',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Net Salary' />,
        cell: ({ row }) => <div className='font-semibold text-green-600'>₹{(row.getValue('netSalary') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'paymentStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = row.getValue('paymentStatus') as string;
            const statusColors = {
                Paid: 'bg-green-100 text-green-700',
                Pending: 'bg-yellow-100 text-yellow-700',
                Failed: 'bg-red-100 text-red-700'
            };
            return (
                <div className={cn('inline-flex rounded px-2 py-1 font-medium text-xs', statusColors[status as keyof typeof statusColors])}>
                    {status}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    }
];
