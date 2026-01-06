'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
//import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterLibraryList } from '@/types/library/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
//import { useCallback } from 'react';

export const masterLibraryColumns: ColumnDef<IMasterLibraryList>[] = [
    {
        accessorKey: 'lmaL_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;

            return <div className='w-full pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'lmaL_LibraryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Library Name' />,
        cell: ({ row }) => <div>{row.getValue('lmaL_LibraryName')}</div>
    },

    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterLibraryList }) {
    // const { openDeleteForm, openEditForm } = useFormContext<IMasterLibraryList>();

    // const handleDelete = useCallback((data: IMasterLibraryList) => openDeleteForm(data), [openDeleteForm]);
    // const handleEdit = useCallback((data: IMasterLibraryList) => openEditForm(data), [openEditForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: false, delete: true }}
            //onDelete={handleDelete}
            //  onEdit={handleEdit}
        />
    );
}
