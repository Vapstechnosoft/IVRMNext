'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IClassWorkMarksList } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Database, Eye, Pencil } from 'lucide-react';
import { format } from 'date-fns';

const columnHelper = createColumnHelper<any>();

/**
 * Columns for the Bottom Grid (Verified Classwork Details)
 */
export const verifiedRecordsColumns: ColumnDef<any>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='text-xs font-black text-black justify-center' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full text-center font-bold text-slate-700'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='text-xs font-black text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] font-bold text-slate-600 uppercase text-left'>{row.getValue('ASMCL_ClassName')}</div>
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='text-xs font-black text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] font-bold text-slate-600 uppercase text-left text-blue-600'>{row.getValue('ASMC_SectionName')}</div>
    },
    {
        accessorKey: 'ISMS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className='text-xs font-black text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] font-medium text-slate-600 text-left'>{row.getValue('ISMS_SubjectName')}</div>
    },
    {
        accessorKey: 'ICW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' className='text-xs font-black text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] font-medium text-slate-600 text-left'>{row.getValue('ICW_Topic')}</div>
    },
    {
        accessorKey: 'ICW_Content',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Content' className='text-xs font-black text-black justify-left' />,
        cell: ({ row }) => <div className='text-[11px] text-slate-600 max-w-[200px] truncate text-left' title={row.getValue('ICW_Content') as string}>{row.getValue('ICW_Content')}</div>
    },
    {
        accessorKey: 'FilesCount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Files' className='text-xs font-black text-black justify-center' />,
        cell: ({ row }) => <div className='text-[11px] font-black text-center text-emerald-600'>{row.getValue('FilesCount') ?? 0}</div>
    },
    {
        id: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' className='text-xs font-black text-black justify-center' />,
        cell: ({ row }) => {
            const date = (row.original as any).ICW_FromDate || (row.original as any).CreatedDate;
            return <div className='text-[11px] font-bold text-center text-slate-600'>{date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-xs font-black text-black justify-center' />,
        cell: ({ row }) => <VerifiedActionCell rowData={row.original} />
    }
];

function VerifiedActionCell({ rowData }: { rowData: any }) {
    const { openDetailsView } = useFormContext<IClassWorkMarksList>();

    return (
        <div className='flex justify-center'>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => openDetailsView({ icW_Id: rowData.ICW_Id, students: [rowData] } as any)}
                className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                title='Edit Mark'
            >
                <Pencil className='h-4 w-4' />
            </Button>
        </div>
    );
}

/**
 * Columns for Search Results (classworklst) 
 */
export const verifyGridColumns: ColumnDef<any>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='text-xs font-black uppercase text-black justify-center' />,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className='text-xs font-black uppercase text-black justify-left' />,
    },
    {
        accessorKey: 'icW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' className='text-xs font-black uppercase text-black justify-left' />,
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='text-xs font-black uppercase text-black justify-center' />,
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='text-xs font-black uppercase text-black justify-center' />,
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
                title='Enter Marks'
                className='hover:text-primary'>
                <Database className='h-4 w-4' />
            </Button>
        </div>
    );
}
