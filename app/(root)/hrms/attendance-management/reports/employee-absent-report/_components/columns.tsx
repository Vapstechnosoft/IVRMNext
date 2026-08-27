'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface EmployeeAbsentReportRow {
    hrme_id?: number;
    ecode?: string;
    ename?: string;
    designation?: string;
    workday?: number;
    absentdays?: number;
    presence_breakdown?: string;
    [key: string]: any;
}

export const employeeAbsentReportColumns: ColumnDef<EmployeeAbsentReportRow>[] = [
    {
        accessorKey: 'hrme_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='ml-4 text-center' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='ml-4 text-left'>{continuousIndex}</div>;
        },

        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'ecode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => <div className='w-fit'>{row.getValue('ecode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ename',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='w-fit'>{row.getValue('ename')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div>{row.getValue('designation')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'absentdays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Absent' />,
        cell: ({ row }) => <div className='font-bold text-destructive'>{row.getValue('absentdays')}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
