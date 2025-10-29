'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterSourceList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterSourceColumns: ColumnDef<IMasterSourceList>[] = [
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
        accessorKey: 'pamS_Id',
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
        accessorKey: 'pamS_SourceName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
        cell: ({ row }) => <div>{row.getValue('pamS_SourceName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'pamS_SourceDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => <div>{row.getValue('pamS_SourceDesc')}</div>,
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

function ActionButtonsCell({ rowData }: { rowData: IMasterSourceList }) {
    const { openEditForm, openDeleteForm } = useFormContext<IMasterSourceList>();

    const handleEdit = useCallback(
        (data: IMasterSourceList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleDelete = useCallback(
        (data: IMasterSourceList) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: true }}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );
}
