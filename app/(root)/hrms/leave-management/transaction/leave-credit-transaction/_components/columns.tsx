'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { BaseEntity } from '@/lib/localdb';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface LeaveCreditTransaction extends BaseEntity {
    type: string[];
    department: string[];
    designation: string[];
    leaveYear: string;
    fromDate?: string;
    toDate?: string;
    totalDays?: number;
    employee?: string;
    lossOfPay?: boolean;
    lossOfPayType?: 'none' | 'full' | 'half' | 'oneFourth' | 'threeFourth';
    lossOfPayAmount?: number;
    leaveName: string;
    availed: number;
}

export const leaveCreditTransactionColumns: ColumnDef<LeaveCreditTransaction>[] = [
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
        accessorKey: 'employee',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('employee') || '-'}</div>
    },
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'availed',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Availed' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('availed')}</div>
    },
    {
        accessorKey: 'fromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => {
            const date = row.getValue('fromDate') as string;
            return <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>;
        }
    },
    {
        accessorKey: 'toDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => {
            const date = row.getValue('toDate') as string;
            return <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>;
        }
    },
    {
        accessorKey: 'lossOfPay',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loss of Pay' />,
        cell: ({ row }) => {
            const lossOfPay = row.getValue('lossOfPay') as boolean;
            return (
                <span
                    className={cn(
                        'inline-flex rounded-full px-2 py-1 font-medium text-xs',
                        lossOfPay ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    )}>
                    {lossOfPay ? 'Yes' : 'No'}
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

function ActionButtonsCell({ rowData }: { rowData: LeaveCreditTransaction }) {
    const { openEditForm } = useFormContext<LeaveCreditTransaction>();

    const handleEdit = useCallback(
        (data: LeaveCreditTransaction) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return <ActionButtons rowData={rowData} buttons={{ edit: true, toggle: false, delete: false }} onEdit={handleEdit} />;
}
