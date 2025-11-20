'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';

export interface HolidayReportRow extends BaseEntity {
    calendarYear: string;
    department: string;
    holidayType: string;
    name: string;
    fromDate: string;
    toDate: string;
    isActive: boolean;
}

export const holidayReportColumns: ColumnDef<HolidayReportRow>[] = [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Holiday Name' />
    },
    {
        accessorKey: 'holidayType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Holiday Type' />
    },
    {
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />
    },
    {
        accessorKey: 'calendarYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Calendar Year' />
    },
    {
        accessorKey: 'fromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => <div>{new Date(row.getValue('fromDate')).toLocaleDateString()}</div>
    },
    {
        accessorKey: 'toDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => <div>{new Date(row.getValue('toDate')).toLocaleDateString()}</div>
    },
    {
        accessorKey: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('isActive') as boolean;
            return <div className={isActive ? 'text-green-600' : 'text-gray-500'}>{isActive ? 'Active' : 'Inactive'}</div>;
        }
    }
];
