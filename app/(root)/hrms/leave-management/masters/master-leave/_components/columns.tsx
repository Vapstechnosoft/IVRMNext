'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import { useCallback } from 'react';

export interface MasterLeave extends BaseEntity {
    leaveName: string;
    leaveCode: string;
    leaveType: string;
    leaveApplyCriteria: string;
    daysForApplyCriteria: string;
    maxDaysForApply: string;
    leaveDetails: string;
    leaveCredit: boolean;
    lateDeduct: boolean;
    probationNotApplicable: boolean;
    leaveOrder: number;
    isActive: boolean;
}

export type Leave = MasterLeave;

export const masterLeaveColumns: ColumnDef<MasterLeave>[] = [
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
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'leaveCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Code' />,
        cell: ({ row }) => <div>{row.getValue('leaveCode')}</div>
    },
    {
        accessorKey: 'leaveType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Type' />,
        cell: ({ row }) => <div>{row.getValue('leaveType')}</div>
    },
    {
        accessorKey: 'leaveOrder',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Order' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('leaveOrder')}</div>
    },
    {
        accessorKey: 'leaveCredit',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Credit' />,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                {row.original.leaveCredit ? <Check className='h-4 w-4 text-green-600' /> : <X className='h-4 w-4 text-red-600' />}
            </div>
        )
    },
    {
        accessorKey: 'lateDeduct',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Deduct' />,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                {row.original.lateDeduct ? <Check className='h-4 w-4 text-green-600' /> : <X className='h-4 w-4 text-red-600' />}
            </div>
        )
    },
    {
        accessorKey: 'probationNotApplicable',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Probation' />,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                {row.original.probationNotApplicable ? (
                    <Check className='h-4 w-4 text-green-600' />
                ) : (
                    <X className='h-4 w-4 text-red-600' />
                )}
            </div>
        )
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: MasterLeave }) {
    const { openEditForm } = useFormContext<MasterLeave>();

    const handleEdit = useCallback(
        (data: MasterLeave) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return <ActionButtons rowData={rowData} buttons={{ edit: true, toggle: false, delete: false }} onEdit={handleEdit} />;
}
