'use client';

import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import type { IMasterMessCategoryMappingDisplay } from '@/schemas/hostel/mess-category-mapping.schema';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useCallback } from 'react';

const columnHelper = createColumnHelper<IMasterMessCategoryMappingDisplay>();

export const messCategoryMappingColumns: ColumnDef<IMasterMessCategoryMappingDisplay, any>[] = [
    {
        accessorKey: 'sn',
        header: ({ column }) => <ColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'hlmM_Name',
        header: ({ column }) => <ColumnHeader column={column} title='Mess Name' />
    },
    {
        accessorKey: 'hlmmC_Name',
        header: ({ column }) => <ColumnHeader column={column} title='Category Name' />
    },
    {
        accessorKey: 'hlmmmC_ActiveFlag',
        header: ({ column }) => <ColumnHeader column={column} title='Status' />,
        cell: ({ row }) =>
            row.original.hlmmmC_ActiveFlag ? (
                <span className='flex items-center text-green-600 font-medium'>
                    <Check className='mr-1 h-4 w-4' /> Active
                </span>
            ) : (
                <span className='flex items-center text-red-600 font-medium'>
                    <X className='mr-1 h-4 w-4' /> Inactive
                </span>
            )
    },
    {
        id: 'actions',
        header: ({ column }) => <ColumnHeader column={column} title='Actions' className='text-center' />,
        cell: (info) => <ActionButtonsCell rowData={info.row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterMessCategoryMappingDisplay }) {
    const { openToggleForm, openEditForm } = useFormContext<IMasterMessCategoryMappingDisplay>();

    const handleToggle = useCallback(
        (data: IMasterMessCategoryMappingDisplay) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    // Editing this specific mapping typically means just toggling/deleting, or maybe opening a form pre-filled.
    // Given the complexity of "edit" (which usually means editing the whole group for a mess), 
    // and the AngularJS code showing "EditData" selecting a single category checkbox,
    // let's assume we can support edit if we want, but for now toggle is key.
    // The previous implementation used openEditForm. Let's wire it up, but note that our add form is bulk.
    // We might need a slightly different logic for "Edit" if it implies checking just one box? 
    // Actually, usually "Edit" loads the state for that Mess ID.

    const handleEdit = useCallback(
        (data: IMasterMessCategoryMappingDisplay) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onToggle={handleToggle}
            onEdit={handleEdit}
            toggleConditionKey='hlmmmC_ActiveFlag'
        />
    );
}
