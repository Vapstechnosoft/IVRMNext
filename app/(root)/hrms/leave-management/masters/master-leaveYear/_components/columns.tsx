'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface LeaveYear extends BaseEntity {
    leaveYear: string;
    fromDate: string;
    toDate: string;
    isActive: boolean;
}

export const leaveYearColumns: ColumnDef<LeaveYear>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'leaveYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Year' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('leaveYear')}</div>
    },
    {
        accessorKey: 'fromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => {
            const date = row.getValue('fromDate') as string;
            return <div>{new Date(date).toLocaleDateString()}</div>;
        }
    },
    {
        accessorKey: 'toDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => {
            const date = row.getValue('toDate') as string;
            return <div>{new Date(date).toLocaleDateString()}</div>;
        }
    },
    {
        accessorKey: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('isActive') as boolean;
            return (
                <span className={isActive ? 'text-green-600' : 'text-red-600'}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            );
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: LeaveYear }) {
    const { openEditForm } = useFormContext<LeaveYear>();

    const handleEdit = useCallback(
        (data: LeaveYear) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: false }}
            onEdit={handleEdit}
        />
    );
}
