'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IHomeWorkDetails } from '@/types/upload/reports/homework-upload-report';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const homeWorkColumns: ColumnDef<IHomeWorkDetails>[] = [
    {
        accessorKey: 'ihW_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName')}</div>
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('asmC_SectionName')}</div>
    },
    {
        accessorKey: 'ihW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' />,
        cell: ({ row }) => <div className='text-left'>{row.getValue('ihW_Topic')}</div>
    },
    {
        id: 'updateDateTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Update Date / Time' />,
        cell: ({ row }) => {
            const date = row.original.createdDate;
            const time = row.original.createdTime;
            return (
                <div className='flex flex-col text-center'>
                    <span>{date || '---'}</span>
                    <span>{time || ''}</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'ihW_Assignment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Assignment' />,
        cell: ({ row }) => <div className='text-left'>{row.getValue('ihW_Assignment')}</div>
    },
    {
        accessorKey: 'ihW_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='homework date' />,
        cell: ({ row }) => (
            <div className='text-center'>
                {row.getValue('ihW_Date') ? 
                    new Date(row.getValue('ihW_Date')).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }) : '---'}
            </div>
        )
    },
    {
        id: 'attachment',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Attachment' className='text-center' />,
        cell: ({ row }) => <AttachmentCell rowData={row.original} />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function AttachmentCell({ rowData }: { rowData: IHomeWorkDetails }) {
    const { openDetailsView } = useFormContext<IHomeWorkDetails>();
    
    const handleView = useCallback(() => {
        openDetailsView(rowData);
    }, [openDetailsView, rowData]);

    if (!rowData.FilesCount || rowData.FilesCount === 0) {
        return <div className='text-center'>---</div>;
    }

    return (
        <div className='flex justify-center'>
            <button 
                type='button' 
                onClick={handleView} 
                className='rounded-md p-2 transition hover:bg-muted font-bold text-blue-600' 
                title='View Attachment'
            >
                <Eye className='h-4 w-4' />
            </button>
        </div>
    );
}

function ActionButtonsCell({ rowData }: { rowData: IHomeWorkDetails }) {
    const { openEditForm, openDeleteForm, openToggleForm } = useFormContext<IHomeWorkDetails>();

    const handleEdit = useCallback((data: IHomeWorkDetails) => openEditForm(data), [openEditForm]);

    const handleToggle = useCallback((data: IHomeWorkDetails) => openToggleForm(data), [openToggleForm]);

    const handleDelete = useCallback((data: IHomeWorkDetails) => openDeleteForm(data), [openDeleteForm]);

    return (
        <div className='flex justify-center'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: true, delete: false }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
                toggleConditionKey='ihW_ActiveFlag'
            />
        </div>
    );
}
