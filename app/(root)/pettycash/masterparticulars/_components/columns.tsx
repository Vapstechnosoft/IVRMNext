'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterParticulars } from '@/types/pettycash/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterParticularsColumns: ColumnDef<IMasterParticulars>[] = [
    {
        accessorKey: 'fyccC_Id',
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
        accessorKey: 'particularName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Particular Name' />,
        cell: ({ row }) => <div>{row.getValue('particularName')}</div>
    },
    {
        accessorKey: 'particularDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Particular Description' />,
        cell: ({ row }) => <div>{row.getValue('particularDesc')}</div>
    },

    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterParticulars }) {
    const { openDeleteForm, openEditForm } = useFormContext<IMasterParticulars>();

    const handleDelete = useCallback((data: IMasterParticulars) => openDeleteForm(data), [openDeleteForm]);
    const handleEdit = useCallback((data: IMasterParticulars) => openEditForm(data), [openEditForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: false, delete: true }}
            onDelete={handleDelete}
            //  onEdit={handleEdit}
        />
    );
}
