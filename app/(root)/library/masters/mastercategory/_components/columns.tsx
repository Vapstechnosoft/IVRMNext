'use client';

import { getStatusBadge } from '@/components/extras/helpers/helper';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterCategoryList } from '@/types/library/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterCategoryColumns: ColumnDef<IMasterCategoryList>[] = [
    {
        accessorKey: 'lmC_Id',
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
        accessorKey: 'lmC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Name' />,
        cell: ({ row }) => <div>{row.getValue('lmC_CategoryName')}</div>
    },
    {
        accessorKey: 'lmC_CategoryCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Code' />,
        cell: ({ row }) => <div>{row.getValue('lmC_CategoryCode')}</div>
    },
    {
        accessorKey: 'lmC_BNBFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Type' />,
        cell: ({ row }) => <div>{row.getValue('lmC_BNBFlg')}</div>
    },
    {
        accessorKey: 'lmC_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => getStatusBadge(row.getValue('lmC_ActiveFlag') === true ? 'yes' : 'no')
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterCategoryList }) {
    const { openToggleForm } = useFormContext<IMasterCategoryList>();

    const handleToggle = useCallback((data: IMasterCategoryList) => openToggleForm(data), [openToggleForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: true, delete: false }}
            onToggle={handleToggle}
            toggleConditionKey='lmC_ActiveFlag'
        />
    );
}
