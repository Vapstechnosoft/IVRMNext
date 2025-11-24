'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface MasterHoliday {
    id: number;
    createdAt: Date;
    calendarYear: string;
    department: string;
    holidayType: string;
    name: string;
    selectedDays: string[];
    fromDate: string;
    toDate: string;
    isActive: boolean;
}

export const masterHolidayColumns: ColumnDef<MasterHoliday>[] = [
    {
        id: 'serialNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. NO.' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'holidayType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
        cell: ({ row }) => <div>{row.getValue('holidayType')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.getValue('department')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => {
            const date = row.getValue('fromDate') as string;
            return <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'toDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => {
            const date = row.getValue('toDate') as string;
            return <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('isActive') as boolean;
            return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: MasterHoliday }) {
    const { openDeleteForm } = useFormContext<MasterHoliday>();

    const handleDelete = useCallback(
        (data: MasterHoliday) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: false, delete: true }}
            onDelete={handleDelete}
        />
    );
}
