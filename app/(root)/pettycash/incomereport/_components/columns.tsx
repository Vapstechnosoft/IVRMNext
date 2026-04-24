'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { IPDAReportIncome, IPDAReportExpense } from '@/types/pettycash/PDAReport';
import { ColumnDef } from '@tanstack/react-table';

export const incomeColumns: ColumnDef<IPDAReportIncome>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='text-center text-xs'>{row.index + 1}</div>,
    },
    {
        accessorKey: 'payment_Mode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Particulars' />,
        cell: ({ row }) => <div className='font-medium text-xs'>{row.getValue('payment_Mode')}</div>,
    },
    {
        accessorKey: 'cashAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Cash Amount' />,
        cell: ({ row }) => <div className='text-right text-xs'>{Number(row.getValue('cashAmount')).toFixed(2)}</div>,
    },
    {
        accessorKey: 'bankAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Bank Amount' />,
        cell: ({ row }) => <div className='text-right text-xs'>{Number(row.getValue('bankAmount')).toFixed(2)}</div>,
    },
    {
        accessorKey: 'fyP_Tot_Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Amount' />,
        cell: ({ row }) => <div className='text-right font-bold text-xs'>{Number(row.getValue('fyP_Tot_Amount')).toFixed(2)}</div>,
    },
];

export const expenseColumns: ColumnDef<IPDAReportExpense>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='text-center text-xs'>{row.index + 1}</div>,
    },
    {
        accessorKey: 'particular',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Particulars' />,
        cell: ({ row }) => <div className='font-medium text-xs'>{row.getValue('particular')}</div>,
    },
    {
        accessorKey: 'pcreqtndeT_Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => <div className='text-right font-bold text-xs'>{Number(row.getValue('pcreqtndeT_Amount')).toFixed(2)}</div>,
    },
];
