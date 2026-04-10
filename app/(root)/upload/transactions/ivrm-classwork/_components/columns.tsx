'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IClassWorkDetails } from '@/types/upload/reports/classwork-upload-report';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Pencil } from 'lucide-react';
import { useCallback } from 'react';

export const classWorkColumns: ColumnDef<IClassWorkDetails>[] = [
    {
        accessorKey: 'icW_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='text-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full text-center'>{pageIndex * pageSize + row.index + 1}</div>;
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
        accessorKey: 'icW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' className='text-bold text-black' />,
        cell: ({ row }) => <div className='text-xs uppercase'>{row.getValue('icW_Topic')}</div>
    },
    {
        accessorKey: 'icW_SubTopic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sub Topic' className='text-bold text-black' />,
        cell: ({ row }) => <div className='text-xs uppercase'>{row.getValue('icW_SubTopic')}</div>
    },
    {
        accessorKey: 'icW_Content',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Content' className='text-bold text-black' />,
        cell: ({ row }) => <div className='text-xs'>{row.getValue('icW_Content')}</div>
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
        id: 'updateDateTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Update Date / Time' className='text-center text-bold text-black' />,
        cell: ({ row }) => {
            const data = row.original as any;
            return <div className='text-xs text-center'>{data.createdDate ? `${data.createdDate} ${data.createdTime || ''}` : '---'}</div>;
        }
    },
    {
        accessorKey: 'icW_FromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Start Date' className='text-center text-bold text-black' />,
        cell: ({ row }) => {
            const date = row.getValue('icW_FromDate');
            return <div className='text-center'>{date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}</div>;
        }
    },
    {
        accessorKey: 'icW_ToDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='End Date' className='text-center text-bold text-black' />,
        cell: ({ row }) => {
            const date = row.getValue('icW_ToDate');
            return <div className='text-center'>{date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}</div>;
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

function AttachmentCell({ rowData }: { rowData: IClassWorkDetails }) {
    const { openDetailsView } = useFormContext<IClassWorkDetails>();
    const hasAttachment = rowData.icW_FilePath || rowData.icW_Attachment;

    if (!hasAttachment) {
        return <div className='text-center'>---</div>;
    }

    return (
        <div className='flex justify-center'>
            <button type='button' onClick={() => openDetailsView(rowData)} className='rounded-md p-1 transition hover:bg-muted' title='View Details'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>
        </div>
    );
}

function StatusCell({ rowData }: { rowData: IClassWorkDetails }) {
    const { openEditForm, openToggleForm } = useFormContext<IClassWorkDetails>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
    const handleToggle = useCallback(() => openToggleForm(rowData), [openToggleForm, rowData]);

    return (
        <div className='flex items-center justify-center gap-2'>
            <button type='button' onClick={handleEdit} className='rounded-md p-1 transition hover:bg-muted' title='Edit'>
                <Pencil className='h-4 w-4 text-blue-600' />
            </button>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: false, toggle: true, delete: false }}
                onToggle={handleToggle}
                toggleConditionKey='icW_ActiveFlag'
            />
        </div>
    );
}
