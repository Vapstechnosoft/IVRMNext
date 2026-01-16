'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { ITrustMaster } from '@/types/super-admin/super-admin-module/trust-masters';
import type { ColumnDef } from '@tanstack/react-table';

export const TrustMasterColumns: ColumnDef<ITrustMaster>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'mO_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Trust Name' />,
        cell: ({ row }) => <div>{row.getValue('mO_Name')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'mO_OrganisationType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Trust Type' />,
        cell: ({ row }) => <div>{row.getValue('mO_OrganisationType')}</div>,
        enableSorting: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Edit/Activate/Deactivate' className='text-center' />,
        cell: ({ row }) => (
            <ActionButtons
                rowData={row.original}
                buttons={{ edit: true, toggle: true, delete: false }}
                toggleConditionKey='mO_ActiveFlag'
                onEdit={(data) => console.log('Edit', data)}
                onToggle={(data, checked) => console.log('Toggle', data, checked)}
            />
        ),
        enableSorting: false
    }
];
