
'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { InvTItemConsumption } from '@/types/inventory/transactions/inv-t-item-consumption';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback } from 'react';

export const invTItemConsumptionColumns: ColumnDef<InvTItemConsumption>[] = [
    {
        accessorKey: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'invmS_StoreName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Store Name' />,
        cell: ({ row }) => <div>{row.getValue('invmS_StoreName')}</div>
    },
    {
        accessorKey: 'invmiC_StuOtherFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
        cell: ({ row }) => <div>{row.getValue('invmiC_StuOtherFlg')}</div>
    },
    {
        accessorKey: 'invmiC_ICNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='IC No.' />,
        cell: ({ row }) => <div>{row.getValue('invmiC_ICNo')}</div>
    },
    {
        accessorKey: 'invmiC_ICDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='IC Date' />,
        cell: ({ row }) => {
            const date = row.getValue('invmiC_ICDate') as string;
            return <div>{date ? format(new Date(date), 'dd/MM/yyyy') : '-'}</div>;
        }
    },
    {
        accessorKey: 'invmiC_Remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => <div>{row.getValue('invmiC_Remarks')}</div>
    },
    {
        accessorKey: 'invmiC_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = row.original.invmiC_ActiveFlg;
            return <Badge variant={status ? 'default' : 'destructive'}>{status ? 'Active' : 'Inactive'}</Badge>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsClient rowData={row.original} />
    }
];

function ActionButtonsClient({ rowData }: { rowData: InvTItemConsumption }) {
    const { openEditForm, openToggleForm, openDetailsView } = useFormContext<InvTItemConsumption>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
    const handleToggle = useCallback(() => openToggleForm(rowData), [openToggleForm, rowData]);
    const handleView = useCallback(() => openDetailsView(rowData), [openDetailsView, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, delete: false, toggle: true}}
                onEdit={handleEdit}
                onToggle={handleToggle}
                
                toggleConditionKey='invmiC_ActiveFlg'
            />
        </div>
    );
}
