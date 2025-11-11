'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface LeaveCredit extends BaseEntity {
    leaveYear: string;
    leaveName: string;
    employeeName: string;
    leaveCredit: number;
    leaveBalance: number;
    type: string[];
    department: string[];
    designation: string[];
}

export const leaveCreditColumns: ColumnDef<LeaveCredit>[] = [
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
        cell: ({ row }) => <div>{row.getValue('leaveYear')}</div>
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeName')}</div>
    },
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'leaveCredit',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Credit' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('leaveCredit')}</div>
    },
    {
        accessorKey: 'leaveBalance',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Balance' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('leaveBalance')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: LeaveCredit }) {
    const { openEditForm } = useFormContext<LeaveCredit>();

    const handleEdit = useCallback(
        (data: LeaveCredit) => {
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
