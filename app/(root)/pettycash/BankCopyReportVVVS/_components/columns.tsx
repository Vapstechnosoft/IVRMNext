'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { IBankCopyReportSummary, IBankCopyReportDetail } from '@/types/pettycash/BankCopyReport';

export const summaryColumns = (onMonthClick: (item: IBankCopyReportSummary) => void): ColumnDef<IBankCopyReportSummary>[] => [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='text-center text-xs'>{row.index + 1}</div>,
    },
    {
        accessorKey: 'month',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Month' />,
        cell: ({ row }) => (
            <div 
                className='text-center text-xs font-bold text-indigo-600 hover:underline cursor-pointer'
                onClick={() => onMonthClick(row.original)}
            >
                {row.getValue('month')}
            </div>
        ),
    },
    {
        accessorKey: 'totalDebit',
        header: ({ column }) => <DataTableColumnHeader column={column} title='DEBIT' />,
        cell: ({ row }) => (
            <div className='text-center text-xs font-bold'>
                {Number(row.getValue('totalDebit')).toFixed(2)}
            </div>
        ),
    },
    {
        accessorKey: 'totalCredit',
        header: ({ column }) => <DataTableColumnHeader column={column} title='CREDIT' />,
        cell: ({ row }) => (
            <div className='text-center text-xs font-bold'>
                {Number(row.getValue('totalCredit')).toFixed(2)}
            </div>
        ),
    },
];

export const detailColumns: ColumnDef<IBankCopyReportDetail>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='text-center text-xs'>{row.index + 1}</div>,
    },
    {
        accessorKey: 'PaymentDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='DATE' />,
        cell: ({ row }) => <div className='text-center text-xs'>{new Date(row.getValue('PaymentDate')).toLocaleDateString('en-GB')}</div>,
    },
    {
        accessorKey: 'Particular',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PARTICULAR' />,
        cell: ({ row }) => <div className='text-left text-xs'>{row.getValue('Particular')}</div>,
    },
    {
        accessorKey: 'Voucher',
        header: ({ column }) => <DataTableColumnHeader column={column} title='VOUCHER' />,
        cell: ({ row }) => <div className='text-center text-xs'>{row.getValue('Voucher')}</div>,
    },
    {
        accessorKey: 'TotalDebit',
        header: ({ column }) => <DataTableColumnHeader column={column} title='DEBIT' />,
        cell: ({ row }) => <div className='text-right text-xs font-medium'>{Number(row.getValue('TotalDebit')).toFixed(2)}</div>,
    },
    {
        accessorKey: 'TotalCredit',
        header: ({ column }) => <DataTableColumnHeader column={column} title='CREDIT' />,
        cell: ({ row }) => <div className='text-right text-xs font-medium'>{Number(row.getValue('TotalCredit')).toFixed(2)}</div>,
    },
];
