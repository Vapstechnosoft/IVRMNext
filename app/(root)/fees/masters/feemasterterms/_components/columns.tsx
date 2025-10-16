'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterTermsList } from '@/types/fees/masters';

import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const feeTermsColumns: ColumnDef<IMasterTermsList>[] = [
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
        accessorKey: 'fmT_Id',
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
        accessorKey: 'fmT_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
        cell: ({ row }) => <div>{row.getValue('fmT_Name')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'fmfS_ECSFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ECS Flag' />,
        // cell: ({ row }) => <div>{row.getValue('fmH_SpecialFeeFlag')}</div>,

        cell: ({ row }) => {
            const value = row.getValue('fmfS_ECSFlag');
            return <div>{value ? '✅' : '❌'}</div>; // or '❌' if you prefer
        },
        enableSorting: true,
        enableHiding: true
    },

    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterTermsList }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterTermsList>();

    const handleEdit = useCallback(
        (data: IMasterTermsList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterTermsList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='fmT_ActiveFlag'
        />
    );
}
