'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
export interface PFChallanRecord {
    id?: number;
    createdAt?: string;
    employeeCode: string;
    employeeName: string;
    pfNumber: string;
    basicSalary: number;
    pfEligibleSalary: number;
    employeePF: number;
    employerPF: number;
    totalPF: number;
    vpfContribution: number;
    pensionContribution: number;
    administrationCharges: number;
    month: string;
    year: string;
}
export const pfChallanColumns: ColumnDef<PFChallanRecord>[] = [
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
        accessorKey: 'pfEligibleSalary',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PF Eligible Salary' />,
        cell: ({ row }) => <div>₹{(row.getValue('pfEligibleSalary') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employeePF',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee PF (12%)' />,
        cell: ({ row }) => <div>₹{(row.getValue('employeePF') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employerPF',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employer PF (12%)' />,
        cell: ({ row }) => <div>₹{(row.getValue('employerPF') as number).toLocaleString()}</div>,
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
        accessorKey: 'pensionContribution',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Pension (8.33%)' />,
        cell: ({ row }) => <div>₹{(row.getValue('pensionContribution') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'totalPF',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total PF' />,
        cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('totalPF') as number).toLocaleString()}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
