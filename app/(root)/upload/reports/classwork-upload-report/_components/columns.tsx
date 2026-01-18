'use client';

import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import type { IClassWorkReport } from '@/types/upload/reports/classwork-upload-report';
import { format } from 'date-fns';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface ColumnsProps {
    onViewAttachment: (item: IClassWorkReport) => void;
}

export const getColumns = ({ onViewAttachment }: ColumnsProps): ColumnDef<IClassWorkReport>[] => [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'icW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' />,
        cell: ({ row }) => <div>{row.getValue('icW_Topic')}</div>,
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>,
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName')}</div>,
    },
    {
        accessorKey: 'icwupl_FileName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='File Name' />,
        cell: ({ row }) => <div>{row.getValue('icwupl_FileName')}</div>,
    },
    {
        accessorKey: 'icwupl_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Upload Date' />,
        cell: ({ row }) => {
            const date = row.original.icwupl_Date;
            return date ? format(new Date(date), 'dd-MM-yyyy') : '';
        },
    },
    {
        id: 'uploadBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Upload By' />,
        cell: ({ row }) => row.original.employeename || row.original.userName,
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='View' className='justify-center' />,
        cell: ({ row }) => {
            const hasAttachment = row.original.icW_Attachment;
            return hasAttachment ? (
                <div className='flex justify-center'>
                    <Button variant='ghost' size='icon' onClick={() => onViewAttachment(row.original)}>
                        <Eye className='h-4 w-4 text-primary' />
                    </Button>
                </div>
            ) : (
                <div className='flex justify-center'>--</div>
            );
        },
    },
];

