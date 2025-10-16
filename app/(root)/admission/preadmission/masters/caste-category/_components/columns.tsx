'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterCasteCategoryList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterCasteCategoryColumns: ColumnDef<IMasterCasteCategoryList>[] = [
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
        accessorKey: 'imcC_Id',
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
        accessorKey: 'imcC_CategoryCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.getValue('imcC_CategoryCode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imcC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Caste Category Name' />,
        cell: ({ row }) => <div>{row.getValue('imcC_CategoryName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imcC_CategoryDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Caste Category Description' />,
        cell: ({ row }) => (
            <div className='max-w-[200px] overflow-hidden truncate text-ellipsis'>
                {row.getValue('imcC_CategoryDesc') === null || row.getValue('imcC_CategoryDesc') === undefined
                    ? 'N.A'
                    : row.getValue('imcC_CategoryDesc')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterCasteCategoryList }) {
    const { openEditForm } = useFormContext<IMasterCasteCategoryList>();

    const handleEdit = useCallback(
        (data: IMasterCasteCategoryList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return <ActionButtons rowData={rowData} buttons={{ edit: true, toggle: false, delete: false }} onEdit={handleEdit} />;
}
