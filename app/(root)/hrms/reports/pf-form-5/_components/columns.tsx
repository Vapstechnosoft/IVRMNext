'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface Form5Record {
    id?: number;
    createdAt?: string;
    serialNo: number;
    employeeCode: string;
    employeeName: string;
    fatherName: string;
    dateOfBirth: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    pfNumber: string;
    designation: string;
    department: string;
    basicSalary: number;
    pfEligibleSalary: number;
    employeePFRate: number;
    employerPFRate: number;
    vpfRate: number;
    nomineeDetails: string;
    status: 'Active' | 'Left' | 'Resigned' | 'Terminated';
    month: string;
    year: string;
}

export const form5Columns: ColumnDef<Form5Record>[] = [
    {
        accessorKey: 'serialNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Serial No.' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('serialNo')}</div>,
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
        accessorKey: 'fatherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Father's Name" />,
        cell: ({ row }) => <div className='text-sm'>{row.getValue('fatherName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'dateOfBirth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Birth' />,
        cell: ({ row }) => <div className='text-sm'>{new Date(row.getValue('dateOfBirth')).toLocaleDateString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'dateOfJoining',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Joining' />,
        cell: ({ row }) => <div className='text-sm'>{new Date(row.getValue('dateOfJoining')).toLocaleDateString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'pfNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PF Number' />,
        cell: ({ row }) => <div className='font-mono text-xs'>{row.getValue('pfNumber')}</div>,
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
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>;
        },
        enableSorting: true,
        enableHiding: true
    }
];

