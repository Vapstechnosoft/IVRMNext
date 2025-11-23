'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';

export interface FOMonthEndReportRow extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    department: string;
    designation: string;
    date: string;
    timeIn?: string;
    timeOut?: string;
    status: string;
}

export const foMonthEndReportColumns: ColumnDef<FOMonthEndReportRow>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{continuousIndex}</div>;
        },
        enableSorting: false
    },
    { accessorKey: 'employeeCode', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' /> },
    { accessorKey: 'employeeName', header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' /> },
    { accessorKey: 'department', header: ({ column }) => <DataTableColumnHeader column={column} title='Department' /> },
    { accessorKey: 'designation', header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' /> },
    { accessorKey: 'date', header: ({ column }) => <DataTableColumnHeader column={column} title='Date' /> },
    { accessorKey: 'timeIn', header: ({ column }) => <DataTableColumnHeader column={column} title='Time In' /> },
    { accessorKey: 'timeOut', header: ({ column }) => <DataTableColumnHeader column={column} title='Time Out' /> },
    { accessorKey: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title='Status' /> }
];
