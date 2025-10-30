'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';

import type { IFeeThirdPartyTransaction } from '@/types/fees/transactions/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const feethirdpartytrasactionColumns: ColumnDef<IFeeThirdPartyTransaction>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
    {
        accessorKey: 'fyptP_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'fyptP_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div>{row.getValue('fyptP_Name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmH_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Head Name	' />,
        cell: ({ row }) => <div>{row.getValue('fmH_FeeName')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fyP_Receipt_No',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt No' />,
        cell: ({ row }) => <div>{row.getValue('fyP_Receipt_No')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fyP_Tot_Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => <div>{row.getValue('fyP_Tot_Amount')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fyptP_Towards',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => <div>{row.getValue('fyptP_Towards')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'fyP_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => <div>{row.getValue('fyP_Date')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'fyP_Bank_Or_Cash',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mode Of Payment' />,
        cell: ({ row }) => <div>{row.getValue('fyP_Bank_Or_Cash')}</div>,
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

function ActionButtonsCell({ rowData }: { rowData: IFeeThirdPartyTransaction }) {
    const { openEditForm, openToggleForm } = useFormContext<IFeeThirdPartyTransaction>();

    const handleEdit = useCallback(
        (data: IFeeThirdPartyTransaction) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IFeeThirdPartyTransaction) => {
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
            toggleConditionKey='fmH_ActiveFlag'
        />
    );
}
