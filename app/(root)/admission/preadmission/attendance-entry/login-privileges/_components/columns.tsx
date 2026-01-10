'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ILoginPrivilege } from '@/types/admission/preadmission/login_privilege';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

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
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'lp_year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Year' />,
        cell: ({ row }) => <div>{row.getValue('lp_year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'lp_staff_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('lp_staff_name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'lp_classes',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('lp_classes')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'lp_sections',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('lp_sections')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: ILoginPrivilege }) {
    const { openEditForm, openToggleForm } = useFormContext<ILoginPrivilege>();

    const handleEdit = useCallback(
        (data: ILoginPrivilege) => {
            openEditForm(data); // This populates selectedRow in context
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
            buttons={{ edit: true, toggle: false, delete: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            // Using delete as the image shows a trash icon
        />
    );
}
