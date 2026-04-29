'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IHomeWorkDetails } from '@/types/upload/reports/homework-upload-report';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Pencil, UserCheck } from 'lucide-react';
import { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';

export const homeWorkColumns: ColumnDef<IHomeWorkDetails>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className=' font-bold text-black justify-center' />,
        cell: ({ row }) => {
            return <div className=' text-black text-center'>{row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ISMS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className=' font-bold uppercase text-black justify-left' />,
        cell: ({ row }) => <div className=''>{row.getValue('ISMS_SubjectName')}</div>
    },

    {
        accessorKey: 'ASMCL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className=' font-bold uppercase text-black justify-center' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ASMCL_ClassName')}</div>
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className=' font-bold uppercase text-black justify-center' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ASMC_SectionName')}</div>
    },
    {
        accessorKey: 'IHW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' className=' font-bold uppercase text-black justify-left' />,
        cell: ({ row }) => <div className=' uppercase'>{row.getValue('IHW_Topic')}</div>
    },
    {
        id: 'updateDateTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Update Date / Time' className=' font-bold text-black justify-center' />,
        cell: ({ row }) => {
            // Usually empty in legacy if not specifically provided as UpdatedDate
            return <div className=' text-center'>---</div>;
        }
    },
    {
        accessorKey: 'IHW_Assignment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Assignment' className=' font-bold uppercase text-black justify-left' />,
        cell: ({ row }) => (
            <div
                className='w-[200px] whitespace-normal break-all line-clamp-2 md:w-[250px]'
                title={row.getValue('IHW_Assignment') || ''}
            >
                {row.getValue('IHW_Assignment')}
            </div>
        )
    },
    {
        accessorKey: 'IHW_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Homework Date' className=' font-bold uppercase text-black justify-center' />,
        cell: ({ row }) => {
            const date = row.getValue('IHW_Date');
            if (!date) return <div className='text-center'>---</div>;
            return (
                <div className='text-center'>
                    {format(new Date(date as string), 'dd-MM-yyyy')}
                </div>
            );
        }
    },
    {
        id: 'attachment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Attachment' className=' font-bold uppercase text-black justify-center' />,
        cell: ({ row }) => <AttachmentCell rowData={row.original} />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className=' font-bold uppercase text-black justify-center' />,
        cell: ({ row }) => <StatusCell rowData={row.original} />
    }
];

function AttachmentCell({ rowData }: { rowData: IHomeWorkDetails }) {
    const { openDetailsView } = useFormContext<IHomeWorkDetails>();
    const hasAttachment = (rowData.FilesCount ?? 0) > 0 || rowData.IHW_FilePath || rowData.IHW_Attachment;

    if (!hasAttachment) {
        return <div className='text-center'>---</div>;
    }

    return (
        <div className='flex justify-center'>
            <button
                type='button'
                onClick={() => openDetailsView(rowData)}
                className='rounded-md p-1 transition hover:bg-muted'
                title='View Details'
            >
                <Eye className='h-4 w-4 text-blue-600' />
            </button>
        </div>
    );
}

function StatusCell({ rowData }: { rowData: IHomeWorkDetails }) {
    const { openEditForm, openToggleForm, openMarksEntry } = useFormContext<IHomeWorkDetails>();

    return (
        <div className='flex items-center justify-center gap-2'>
            <button
                type='button'
                onClick={() => openEditForm(rowData)}
                className='rounded-md p-1 transition hover:bg-muted text-blue-600'
                title='Edit'
            >
                <Pencil className='h-4 w-4' />
            </button>
            <button
                type='button'
                onClick={() => openMarksEntry(rowData)}
                className='rounded-md p-1 transition hover:bg-muted text-green-600 flex items-center gap-1 border border-green-100 bg-green-50/50 px-2'
                title='Marks Entry'
            >
                <UserCheck className='h-4 w-4' />
                <span className='text-[10px] font-bold'>MARKS</span>
            </button>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: false, toggle: true, delete: false }}
                onToggle={() => openToggleForm(rowData)}
                toggleConditionKey='IHW_ActiveFlag'
            />
        </div>
    );
}
