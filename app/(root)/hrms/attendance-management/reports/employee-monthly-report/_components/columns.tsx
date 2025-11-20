'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';

export interface MonthlyRow extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    designation: string;
    dateOfJoining?: string;
    totalWorkingDays?: number;
    totalAbsentDays?: number;
    totalPresentDays?: number;
    totalHolidayPunches?: number;
    // Add more fields as needed based on the actual report structure
}

export const employeeMonthlyReportColumns: ColumnDef<MonthlyRow>[] = [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No' />,
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
    { accessorKey: 'designation', header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' /> },
    { 
        accessorKey: 'dateOfJoining', 
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Joining' />,
        cell: ({ row }) => {
            const date = row.getValue('dateOfJoining') as string | undefined;
            return date ? new Date(date).toLocaleDateString('en-GB') : '-';
        }
    },
    { 
        accessorKey: 'totalWorkingDays', 
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Working Days' /> 
    },
    { 
        accessorKey: 'totalPresentDays', 
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Present Days' /> 
    },
    { 
        accessorKey: 'totalAbsentDays', 
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Absent Days' /> 
    },
    { 
        accessorKey: 'totalHolidayPunches', 
        header: ({ column }) => <DataTableColumnHeader column={column} title='Holiday Punches' /> 
    }
];

