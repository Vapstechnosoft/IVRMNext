'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IHomeWorkMarksList } from '@/schemas/upload/transactions/ivrm-homework.schema';
import { ColumnDef } from '@tanstack/react-table';
import { Database, Pencil } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Columns for the Bottom Grid (Verified Records/HomeWork Details)
 */
export const verifiedRecordsColumns: ColumnDef<any>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='text-xs font-black uppercase text-black justify-center' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full text-center font-bold text-slate-700'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='text-xs font-black uppercase text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] font-bold text-slate-600 uppercase'>{row.getValue('studentname')}</div>
    },
    {
        accessorKey: 'ISMS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className='text-xs font-black uppercase text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] font-medium text-slate-600'>{row.getValue('ISMS_SubjectName')}</div>
    },
    {
        accessorKey: 'IHW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' className='text-xs font-black uppercase text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] font-medium text-slate-600'>{row.getValue('IHW_Topic')}</div>
    },
    {
        accessorKey: 'UpdatedDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' className='text-xs font-black uppercase text-black justify-center' />,
        cell: ({ row }) => {
            const date = row.getValue('UpdatedDate');
            return <div className='text-[11px] font-bold text-center text-slate-600'>{date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}</div>;
        }
    },
    {
        id: 'time',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Time' className='text-xs font-black uppercase text-black justify-center' />,
        cell: ({ row }) => {
            const date = row.original.UpdatedDate;
            return <div className='text-[11px] text-center text-slate-400 font-medium'>{date ? format(new Date(date), 'HH:mm') : '---'}</div>;
        }
    },
    {
        accessorKey: 'IHW_Assignment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Assignment' className='text-xs font-black uppercase text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] text-slate-500 italic max-w-[150px] truncate' title={row.getValue('IHW_Assignment')}>{row.getValue('IHW_Assignment') || '---'}</div>
    },
    {
        accessorKey: 'IHWUPL_Marks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Marks' className='text-xs font-black uppercase text-black justify-center' />,
        cell: ({ row }) => <div className='text-[11px] font-black text-center text-blue-600'>{row.getValue('IHWUPL_Marks') ?? '---'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-xs font-black uppercase text-black justify-center' />,
        cell: ({ row }) => <VerifiedActionCell rowData={row.original} />
    }
];

function VerifiedActionCell({ rowData }: { rowData: any }) {
    const { openDetailsView } = useFormContext<IHomeWorkMarksList>();

    return (
        <div className='flex justify-center'>
            <Button 
                variant='ghost' 
                size='icon' 
                onClick={() => openDetailsView({ ihW_Id: rowData.IHW_Id, students: [rowData] })}
                className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                title='Edit Mark'
            >
                <Pencil className='h-4 w-4' />
            </Button>
        </div>
    );
}

/**
 * Columns for Search Results Grid (HomeWork Update List)
 */
export const verifyGridColumns: ColumnDef<any>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='text-xs font-black uppercase text-black justify-center' />,
        cell: ({ row }) => <div className='text-center font-bold text-slate-600'>{row.index + 1}</div>,
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className='text-xs font-black uppercase text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] font-bold text-slate-600 uppercase'>{row.getValue('ismS_SubjectName')}</div>
    },
    {
        accessorKey: 'ihW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' className='text-xs font-black uppercase text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] font-medium text-slate-600'>{row.getValue('ihW_Topic')}</div>
    },
    {
        accessorKey: 'ihW_Assignment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Assignment' className='text-xs font-black uppercase text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] text-slate-500 italic max-w-[150px] truncate'>{row.getValue('ihW_Assignment') || '---'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-xs font-black uppercase text-black justify-center' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: any }) {
    const { openDetailsView } = useFormContext<any>();

    return (
        <div className='flex justify-center'>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => openDetailsView(rowData)}
                className='text-blue-600 hover:bg-blue-50'
                title='Enter Marks'
            >
                <Database className='h-4 w-4' />
            </Button>
        </div>
    );
}
