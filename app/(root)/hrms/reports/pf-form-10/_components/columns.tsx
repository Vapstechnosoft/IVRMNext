'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
export interface Form10Record {
    id?: number;
    createdAt?: string;
    employeeCode: string;
    employeeName: string;
    pfNumber: string;
    fatherName: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    openingBalance: number;
    employeeContribution: number;
    employerContribution: number;
    vpfContribution: number;
    interestEarned: number;
    totalContribution: number;
    withdrawalAmount: number;
    closingBalance: number;
    month: string;
    year: string;
    financialYear: string;
}
export const form10Columns: ColumnDef<Form10Record>[] = [
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
        accessorKey: 'pfNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PF Number' />,
        cell: ({ row }) => <div className='font-mono'>{row.getValue('pfNumber')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fatherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Father's Name" />,
        cell: ({ row }) => <div>{row.getValue('fatherName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'openingBalance',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Opening Balance' />,
        cell: ({ row }) => <div>₹{(row.getValue('openingBalance') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employeeContribution',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Contribution' />,
        cell: ({ row }) => <div>₹{(row.getValue('employeeContribution') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employerContribution',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employer Contribution' />,
        cell: ({ row }) => <div>₹{(row.getValue('employerContribution') as number).toLocaleString()}</div>,
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
        accessorKey: 'closingBalance',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Closing Balance' />,
        cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('closingBalance') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
