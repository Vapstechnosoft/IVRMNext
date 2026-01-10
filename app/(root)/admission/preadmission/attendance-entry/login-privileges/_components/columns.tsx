'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface ILoginPrivilege {
    id: number;
    role: string;
    class: string;
    section: string;
    activeFlag: boolean;
}

export const loginPrivilegeColumns: ColumnDef<ILoginPrivilege>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Role' />,
        cell: ({ row }) => <div>{row.getValue('role')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'class',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('class')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'section',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('section')}</div>,
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

function ActionButtonsCell({ rowData }: { rowData: ILoginPrivilege }) {
    const { openEditForm, openToggleForm } = useFormContext<ILoginPrivilege>();

    const handleEdit = useCallback(
        (data: ILoginPrivilege) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: ILoginPrivilege) => {
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
            toggleConditionKey='activeFlag'
        />
    );
}
