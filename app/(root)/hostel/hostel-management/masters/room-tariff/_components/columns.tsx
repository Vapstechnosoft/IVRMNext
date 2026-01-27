'use client';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { IRoomTariff } from '@/server/hostel/room-tariff/server-action';
import { useFormContext } from '@/components/ui/form/form-provider';

const columnHelper = createColumnHelper<IRoomTariff>();

export const roomTariffColumns: ColumnDef<IRoomTariff, any>[] = [
    columnHelper.display({
        id: 'slno',
        header: 'SL NO',
        cell: (info) => info.row.index + 1,
        enableSorting: false,
    }),
    columnHelper.accessor('asmaY_Year', {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
    }),
    columnHelper.accessor('hrmrM_RoomNo', {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Room" />,
    }),
    columnHelper.accessor('hlmrtF_SORate', {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Single Bed Rate" />,
    }),
    columnHelper.accessor('hlmrtF_RoomRate', {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Entire Room Rate" />,
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
    }),
];

function ActionButtonsCell({ rowData }: { rowData: IRoomTariff }) {
    const { openEditForm, openToggleForm } = useFormContext<IRoomTariff>();

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true }}
            onEdit={openEditForm}
            onToggle={openToggleForm}
            toggleConditionKey="hlmrtF_ActiveFlag"
        />
    );
}
