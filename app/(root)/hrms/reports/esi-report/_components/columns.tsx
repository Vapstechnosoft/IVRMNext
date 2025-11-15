'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';

export interface ESIRecord {
    id?: number;
    createdAt?: string;
    employeeCode: string;
    employeeName: string;
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    departmentName: string;
    designationName: string;
    esiNumber: string;
    grossSalary: number;
    esiEligibleSalary: number;
    employeeESI: number;
    employerESI: number;
    totalESI: number;
    month: string;
    year: string;
    workingDays: number;
    presentDays: number;
    esiStatus: 'Active' | 'Inactive' | 'Exempted';
}

export const esiReportColumns: ColumnDef<ESIRecord>[] = [
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
        cell: ({ row }) => <div>{row.getValue('departmentName')}</div>,
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
        accessorKey: 'esiNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ESI Number' />,
        cell: ({ row }) => <div className='font-mono'>{row.getValue('esiNumber')}</div>,
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
        accessorKey: 'esiEligibleSalary',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ESI Eligible Salary' />,
        cell: ({ row }) => <div>₹{(row.getValue('esiEligibleSalary') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employeeESI',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee ESI (0.75%)' />,
        cell: ({ row }) => <div>₹{(row.getValue('employeeESI') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employerESI',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employer ESI (3.25%)' />,
        cell: ({ row }) => <div>₹{(row.getValue('employerESI') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'totalESI',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total ESI' />,
        cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('totalESI') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'esiStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ESI Status' />,
        cell: ({ row }) => {
            const status = row.getValue('esiStatus') as string;
            return (
                <span
                    className={cn(
                        'rounded-full px-2 py-1 font-medium text-xs',
                        status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : status === 'Inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                    )}>
                    {status}
                </span>
            );
        },
        enableSorting: true,
        enableHiding: true
    }
];

