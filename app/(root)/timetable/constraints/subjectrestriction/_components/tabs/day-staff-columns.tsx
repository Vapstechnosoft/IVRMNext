'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface IDayStaffList {
    ttrdS_Id: number;
    asmaY_Year: string;
    ttmD_DayName: string;
    staffName: string;
    ttrdS_ActiveFlag: boolean;
    // Add other fields if returned by API
}

export const columns: ColumnDef<IDayStaffList>[] = [
    {
        accessorKey: 'ttrdS_Id',
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
        accessorKey: 'ttmD_DayName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day' />,
        cell: ({ row }) => <div>{row.getValue('ttmD_DayName')}</div>
    },
    {
        accessorKey: 'staffName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff' />,
        cell: ({ row }) => <div>{row.getValue('staffName')}</div>
    },
    {
        accessorKey: 'ttrdS_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
        cell: ({ row }) => (
            <div>
                {row.original.ttrdS_ActiveFlag ? (
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

function ActionButtonsCell({ rowData }: { rowData: IDayStaffList }) {
    const { openEditForm, openToggleForm } = useFormContext<IDayStaffList>();

    const handleEdit = useCallback(
        (data: IDayStaffList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IDayStaffList) => {
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
            toggleConditionKey='ttrdS_ActiveFlag'
        />
    );
}
