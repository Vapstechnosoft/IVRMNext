'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterGroupsGrouping } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const feegroupgroupingColoumn: ColumnDef<IMasterGroupsGrouping>[] = [
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
        accessorKey: 'imgg_Id',
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
        accessorKey: 'imgg_GroupingName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        cell: ({ row }) => <div>{row.getValue('imgg_GroupingName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imgg_Code',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Code' />,
        cell: ({ row }) => <div>{row.getValue('imgg_Code')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'immgg_feeGroupNames',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Group Names' />,
        cell: ({ row }) => <div>{row.getValue('immgg_feeGroupNames')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imgg_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active Status' />,
        cell: ({ row }) => {
            const value = row.getValue('imgg_ActiveFlag');
            return <div>{value ? '✅' : '❌'}</div>;
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

function ActionButtonsCell({ rowData }: { rowData: IMasterGroupsGrouping }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterGroupsGrouping>();

    const handleEdit = useCallback(
        (data: IMasterGroupsGrouping) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterGroupsGrouping) => {
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
            toggleConditionKey='imgg_ActiveFlag'
        />
    );
}
