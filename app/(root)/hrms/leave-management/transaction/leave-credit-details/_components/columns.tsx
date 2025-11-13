'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface LeaveCreditDetail extends BaseEntity {
    type: string[];
    department: string[];
    designation: string[];
    leaveName: string;
    leaveCode?: string;
    months: Record<string, number>;
}

export const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

export const leaveCreditDetailColumns: ColumnDef<LeaveCreditDetail>[] = [
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
        cell: ({ row }) => <div>{row.getValue('leaveCode') || '-'}</div>
    },
    ...MONTHS.map((m) => ({
        accessorKey: `months.${m}`,
        header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title={m} />,
        cell: ({ row }: { row: any }) => {
            const months = row.original.months || {};
            return <div className='text-center'>{months[m] || 0}</div>;
        }
    })),
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: LeaveCreditDetail }) {
    const { openEditForm } = useFormContext<LeaveCreditDetail>();

    const handleEdit = useCallback(
        (data: LeaveCreditDetail) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return <ActionButtons rowData={rowData} buttons={{ edit: true, toggle: false, delete: false }} onEdit={handleEdit} />;
}
