'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
export interface MonthlyTransaction {
    month: string;
    basicSalary: number;
    pfEligibleSalary: number;
    employeeContribution: number;
    employerContribution: number;
    vpfContribution: number;
    interestEarned: number;
    withdrawalAmount: number;
    runningBalance: number;
}
export const form3AColumns: ColumnDef<MonthlyTransaction>[] = [
    {
        accessorKey: 'month',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Month' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('month')}</div>,
        enableSorting: false,
        enableHiding: false,
        size: 100
    },
    {
        accessorKey: 'basicSalary',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Basic Salary' />,
        cell: ({ row }) => <div>₹{(row.getValue('basicSalary') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'pfEligibleSalary',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PF Eligible Salary' />,
        cell: ({ row }) => <div>₹{(row.getValue('pfEligibleSalary') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employeeContribution',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee PF (12%)' />,
        cell: ({ row }) => <div>₹{(row.getValue('employeeContribution') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employerContribution',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employer PF (12%)' />,
        cell: ({ row }) => <div>₹{(row.getValue('employerContribution') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'vpfContribution',
        header: ({ column }) => <DataTableColumnHeader column={column} title='VPF' />,
        cell: ({ row }) => <div>₹{(row.getValue('vpfContribution') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'interestEarned',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Interest Earned' />,
        cell: ({ row }) => <div>₹{(row.getValue('interestEarned') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'withdrawalAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Withdrawals' />,
        cell: ({ row }) => <div>₹{(row.getValue('withdrawalAmount') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'runningBalance',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Running Balance' />,
        cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('runningBalance') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
