'use client';

import type { IMessMenu } from '@/actions/hostel/mess-menu';
import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import { useCallback } from 'react';

const columnHelper = createColumnHelper<IMessMenu>();

export const messMenuColumns: ColumnDef<IMessMenu, any>[] = [
    columnHelper.display({
        id: 'sn',
        header: 'SL NO',
        cell: (info) => info.row.index + 1,
        enableSorting: false
    }),
    columnHelper.accessor('hlmM_Name', {
        header: ({ column }) => <ColumnHeader column={column} title='Mess Name' />,
        meta: { title: 'Mess Name' }
    }),
    columnHelper.accessor('hlmmC_Name', {
        header: ({ column }) => <ColumnHeader column={column} title='Mess Category' />,
        meta: { title: 'Mess Category' }
    }),
    columnHelper.accessor('hlmmN_MenuName', {
        header: ({ column }) => <ColumnHeader column={column} title='Menu Name' />,
        meta: { title: 'Menu Name' }
    }),
    columnHelper.accessor('hlmmN_MenuDesc', {
        header: ({ column }) => <ColumnHeader column={column} title='Description' />,
        meta: { title: 'Description' }
    }),
    columnHelper.accessor('hlmmN_ActiveFlag', {
        header: ({ column }) => <ColumnHeader column={column} title='Status' />,
        meta: { title: 'Status' },
        cell: (info) =>
            info.getValue() ? (
                <span className='flex items-center font-medium text-green-600'>
                    <Check className='mr-1 h-4 w-4' /> Active
                </span>
            ) : (
                <span className='flex items-center font-medium text-red-600'>
                    <X className='mr-1 h-4 w-4' /> Inactive
                </span>
            )
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => <ActionButtonsCell rowData={info.row.original} />
    })
];

function ActionButtonsCell({ rowData }: { rowData: IMessMenu }) {
    const { openEditForm, openToggleForm } = useFormContext<IMessMenu>();

    const handleEdit = useCallback(
        (data: IMessMenu) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMessMenu) => {
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
            toggleConditionKey='hlmmN_ActiveFlag'
        />
    );
}
