'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface IPeriodStaffList {
    ttrpS_Id: number;
    asmaY_Year: string;
    ttmP_PeriodName: string;
    staffName: string;
    ttrpS_ActiveFlag: boolean;
    ttrpS_SUbSelcFlag: boolean;
}

export const columns: ColumnDef<IPeriodStaffList>[] = [
    {
        accessorKey: 'ttrpS_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>
    },
    {
        accessorKey: 'ttmP_PeriodName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Period' />,
        cell: ({ row }) => <div>{row.getValue('ttmP_PeriodName')}</div>
    },
    {
        accessorKey: 'staffName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff' />,
        cell: ({ row }) => <div>{row.getValue('staffName')}</div>
    },
    {
        accessorKey: 'ttrpS_SUbSelcFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Restriction Level' />,
        cell: ({ row }) => (
            <div className={`font-medium ${row.original.ttrpS_SUbSelcFlag ? 'text-blue-600' : 'text-green-600'}`}>
                {row.original.ttrpS_SUbSelcFlag ? 'Class-Section Wise' : 'General'}
            </div>
        )
    },
    {
        accessorKey: 'ttrpS_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => (
            <div>
                {row.original.ttrpS_ActiveFlag ? (
                    <span className='rounded bg-green-100 px-2 py-1 font-semibold text-green-800 text-xs'>Active</span>
                ) : (
                    <span className='rounded bg-red-100 px-2 py-1 font-semibold text-red-800 text-xs'>Inactive</span>
                )}
            </div>
        )
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IPeriodStaffList }) {
    const { openEditForm, openToggleForm } = useFormContext<IPeriodStaffList>();

    const handleEdit = useCallback(
        (data: IPeriodStaffList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IPeriodStaffList) => {
            if (openToggleForm) openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='ttrpS_ActiveFlag'
        />
    );
}
