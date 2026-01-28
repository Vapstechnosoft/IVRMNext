import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IInvItemStoreMapping } from '@/types/inventory/masters/inv-item-store-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const InvItemStoreMappingColumns: ColumnDef<IInvItemStoreMapping>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'invmsT_StoreName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Store Name' />,
        cell: ({ row }) => <div>{row.getValue('invmsT_StoreName')}</div>
    },
    {
        accessorKey: 'invmI_ItemName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Item Name' />,
        cell: ({ row }) => <div>{row.getValue('invmI_ItemName')}</div>
    },
    {
        accessorKey: 'invmG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
        cell: ({ row }) => <div>{row.getValue('invmG_GroupName')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IInvItemStoreMapping }) {
    const { openEditForm } = useFormContext<IInvItemStoreMapping>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, delete: false, toggle: true }}
                onEdit={handleEdit}
                toggleConditionKey='invmisM_ActiveFlg'
            />
        </div>
    );
}
