'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IHomeWorkDetails } from '@/types/upload/reports/homework-upload-report';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Pencil } from 'lucide-react';
import { useCallback } from 'react';

export const homeWorkColumns: ColumnDef<IHomeWorkDetails>[] = [
    {
        accessorKey: 'ihW_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='text-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='text-bold text-black text-center'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className='text-bold text-black' />,
        cell: ({ row }) => <div className='text-xs'>{row.getValue('ismS_SubjectName')}</div>
    },

    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='text-center text-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('asmcL_ClassName')}</div>
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='text-center text-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('asmC_SectionName')}</div>
    },
    {
        accessorKey: 'ihW_AssignmentNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Assignment No' className='text-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ihW_AssignmentNo') || '---'}</div>
    },
    {
        accessorKey: 'ihW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' className='text-bold text-black' />,
        cell: ({ row }) => <div className='text-xs uppercase'>{row.getValue('ihW_Topic')}</div>
    },
    {
        id: 'updateDateTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Update Date / Time' className='text-bold text-black' />,
        cell: ({ row }) => {
            const data = row.original as any;
            return <div className='text-xs text-center'>{data.createdDate ? `${data.createdDate} ${data.createdTime || ''}` : '---'}</div>;
        }
    },
    {
        accessorKey: 'ihW_Assignment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Assignment' className='text-bold text-black' />,
        cell: ({ row }) => <div className='text-xs'>{row.getValue('ihW_Assignment')}</div>
    },

    {
        accessorKey: 'ihW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' />,
        cell: ({ row }) => <div>{row.getValue('ihW_Topic')}</div>
    },




    {
        accessorKey: 'ihW_Assignment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Assignment' />,
        cell: ({ row }) => (
            <div
                className='w-[200px] md:w-[300px] lg:w-[400px] whitespace-normal break-all line-clamp-2'
                title={row.getValue('ihW_Assignment')}
            >
                {row.getValue('ihW_Assignment')}
            </div>
        )
    },



    {
        accessorKey: 'ihW_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Homework Date' className='text-center text-bold text-black' />,
        cell: ({ row }) => {
            const date = row.getValue('ihW_Date');
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Attachment' className='text-center text-bold text-black' />,
        cell: ({ row }) => <AttachmentCell rowData={row.original} />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' className='text-center text-bold text-black' />,
        cell: ({ row }) => <StatusCell rowData={row.original} />
    }
];

function AttachmentCell({ rowData }: { rowData: IHomeWorkDetails }) {
    const { openDetailsView } = useFormContext<IHomeWorkDetails>();
    const hasAttachment = rowData.ihW_FilePath || rowData.ihW_Attachment;

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
    const { openEditForm, openToggleForm } = useFormContext<IHomeWorkDetails>();

    return (
        <div className='flex items-center justify-center gap-2'>
            <button
                type='button'
                onClick={() => openEditForm(rowData)}
                className='rounded-md p-1 transition hover:bg-muted'
                title='Edit'
            >
                <Pencil className='h-4 w-4 text-blue-600' />
            </button>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: false, toggle: true, delete: false }}
                onToggle={() => openToggleForm(rowData)}
                toggleConditionKey='ihW_ActiveFlag'
            />
        </div>
    );
}
