'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface LeaveCarryForward extends BaseEntity {
    fromYear: string;
    toYear: string;
    employeeName: string;
    department: string;
    designation: string;
    leaveName: string;
    carryDays: number;
}

export const leaveCarryForwardColumns: ColumnDef<LeaveCarryForward>[] = [
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
        accessorKey: 'fromYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Year' />,
        cell: ({ row }) => <div>{row.getValue('fromYear')}</div>
    },
    {
        accessorKey: 'toYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Year' />,
        cell: ({ row }) => <div>{row.getValue('toYear')}</div>
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeName')}</div>
    },
    {
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.getValue('department')}</div>
    },
    {
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div>{row.getValue('designation')}</div>
    },
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'carryDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Carry Days' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('carryDays')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: LeaveCarryForward }) {
    const { openEditForm } = useFormContext<LeaveCarryForward>();

    const handleEdit = useCallback(
        (data: LeaveCarryForward) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return <ActionButtons rowData={rowData} buttons={{ edit: true, toggle: false, delete: false }} onEdit={handleEdit} />;
}
