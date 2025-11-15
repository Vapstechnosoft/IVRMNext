'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface MonthEndRecord {
    id?: number;
    createdAt?: string;
    employeeCode: string;
    employeeName: string;
    groupType: string;
    department: string;
    designation: string;
    basicSalary: number;
    allowances: number;
    grossSalary: number;
    pfContribution: number;
    esiContribution: number;
    incomeTax: number;
    otherDeductions: number;
    totalDeductions: number;
    netSalary: number;
    workingDays: number;
    presentDays: number;
    absentDays: number;
    leavesTaken: number;
    overtime: number;
    status: 'Active' | 'On Leave' | 'Absent' | 'Resigned';
    month: string;
    year: string;
    ieName: string;
}

export const monthEndReportColumns: ColumnDef<MonthEndRecord>[] = [
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
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div className='text-sm'>{row.getValue('department')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div className='text-sm'>{row.getValue('designation')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'basicSalary',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Basic Salary' />,
        cell: ({ row }) => <div>₹{(row.getValue('basicSalary') as number).toLocaleString()}</div>,
        enableSorting: true,
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
        accessorKey: 'totalDeductions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Deductions' />,
        cell: ({ row }) => <div>₹{(row.getValue('totalDeductions') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'netSalary',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Net Salary' />,
        cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('netSalary') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'presentDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Present Days' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('presentDays')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const variant =
                status === 'Active' ? 'default' : status === 'On Leave' ? 'secondary' : status === 'Absent' ? 'destructive' : 'outline';
            return <Badge variant={variant}>{status}</Badge>;
        },
        enableSorting: true,
        enableHiding: true
    }
];

