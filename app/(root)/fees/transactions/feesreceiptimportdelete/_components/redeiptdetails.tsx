'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IFeeReceiptImportDelate } from '@/types/fees/transactions/transactions';
import type { ColumnDef } from '@tanstack/react-table';

export const feereceiptimportdeleteColumns: ColumnDef<IFeeReceiptImportDelate>[] = [
    {
        accessorKey: 'fyP_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div>{row.getValue('studentname')}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'admissionnumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Admission No' />,
        cell: ({ row }) => <div>{row.getValue('admissionnumber')}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => <div>{row.getValue('date')}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'receiptno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt No' />,
        cell: ({ row }) => <div>{row.getValue('receiptno')}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => <div>₹{Number(row.getValue('amount')).toLocaleString('en-IN')}</div>,
        enableSorting: false,
        enableHiding: false
    }
];
