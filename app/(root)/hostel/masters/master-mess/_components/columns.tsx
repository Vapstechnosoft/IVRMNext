'use client';

import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMess } from '@/server/hostel/master-mess/server-action';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<IMess>();

export const masterMessColumns: ColumnDef<IMess, any>[] = [
    columnHelper.display({
        id: 'sn',
        header: 'SL.No.',
        cell: (info) => info.row.index + 1,
        enableSorting: false
    }),
    columnHelper.accessor('hlmM_Name', {
        header: ({ column }) => <ColumnHeader column={column} title='Mess Name' />
    }),
    columnHelper.accessor('hlmM_BFSStartTime', {
        header: ({ column }) => <ColumnHeader column={column} title='Breakfast' />,
        cell: (info) => info.getValue() || '-'
    }),
    columnHelper.accessor('hlmM_LNStartTime', {
        header: ({ column }) => <ColumnHeader column={column} title='Lunch' />,
        cell: (info) => info.getValue() || '-'
    }),
    columnHelper.accessor('hlmM_DNSStartTime', {
        header: ({ column }) => <ColumnHeader column={column} title='Dinner' />,
        cell: (info) => info.getValue() || '-'
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Action',
        cell: (info) => <ActionButtonsCell rowData={info.row.original} />
    })
];

function ActionButtonsCell({ rowData }: { rowData: IMess }) {
    const { openEditForm, openToggleForm } = useFormContext<IMess>();
    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={openEditForm}
            onToggle={openToggleForm}
            toggleConditionKey='hlmM_ActiveFlag'
        />
    );
}
