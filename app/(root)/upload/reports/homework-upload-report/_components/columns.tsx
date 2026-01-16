'use client';

import { Button } from '@/components/ui/button';
import type { IHomeWorkReport } from '@/types/upload/reports/homework-upload-report';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface GetColumnsProps {
    onViewAttachment: (item: IHomeWorkReport) => void;
}

export const getColumns = ({ onViewAttachment }: GetColumnsProps): ColumnDef<IHomeWorkReport>[] => [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'ihW_Topic',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' />,
        cell: ({ row }) => <div>{row.getValue('ihW_Topic')}</div>,
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
        accessorKey: 'ihwupl_FileName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='File Name' />,
        cell: ({ row }) => <div>{row.getValue('ihwupl_FileName')}</div>,
    },
    {
        accessorKey: 'ihwupl_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Upload Date' />,
        cell: ({ row }) => {
            const date = row.original.ihwupl_Date;
            return date ? format(new Date(date), 'dd-MM-yyyy') : '--';
        },
    },
    {
        id: 'uploadBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Upload By' />,
        cell: ({ row }) => {
            const item = row.original;
            return item.employeename || item.userName || '--';
        },
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='View' className='justify-center' />,
        cell: ({ row }) => {
            const item = row.original;
            return item.ihW_Attachment ? (
                <div className='flex justify-center'>
                    <Button variant='ghost' size='icon' onClick={() => onViewAttachment(item)}>
                        <Eye className='h-4 w-4 text-primary' />
                    </Button>
                </div>
            ) : (
                <div className='flex justify-center'>--</div>
            );
        },
    },
];

