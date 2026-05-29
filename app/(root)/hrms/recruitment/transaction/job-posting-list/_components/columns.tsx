'use client';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Trash2 } from 'lucide-react';

export interface JobPostingListItem {
    hrmrf_Id: number;
    hrmrf_MRFNO: string;
    hrmP_Position: string;
    hrmD_DepartmentName: string;
    hrmrf_JobLocation: string;
    hrmrf_NoofPosition: number;
    hrmrf_Skills: string;
    hrmrf_ActiveFlg?: boolean;
}

export const jobPostingListColumns: ColumnDef<any>[] = [
    {
        id: 'serialNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrmrf_MRFNO',
        header: ({ column }) => <DataTableColumnHeader column={column} title='MRF No.' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrmrf_MRFNO') || '-'}</div>
    },
    {
        accessorKey: 'hrmD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.getValue('hrmD_DepartmentName') || '-'}</div>
    },
    {
        accessorKey: 'hrmP_Position',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Position' />,
        cell: ({ row }) => <div>{row.getValue('hrmP_Position') || '-'}</div>
    },
    {
        accessorKey: 'hrmrf_JobLocation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Location' />,
        cell: ({ row }) => <div>{row.getValue('hrmrf_JobLocation') || '-'}</div>
    },
    {
        accessorKey: 'hrmrf_NoofPosition',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No. of Positions' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrmrf_NoofPosition') ?? 0}</div>
    },
    {
        accessorKey: 'hrmrf_Skills',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Skills' />,
        cell: ({ row }) => <div className='truncate max-w-[200px]'>{row.getValue('hrmrf_Skills') || '-'}</div>
    },
    {
        accessorKey: 'hrmrf_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const active = row.getValue('hrmrf_ActiveFlg');
            return (
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {active ? 'Active' : 'Inactive'}
                </span>
            );
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: () => (
            <div className='flex items-center gap-2'>
                <Button variant='ghost' size='sm' className='text-blue-600 hover:text-blue-800'>
                    <Eye className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='sm' className='text-red-600 hover:text-red-800'>
                    <Trash2 className='h-4 w-4' />
                </Button>
            </div>
        )
    }
];
