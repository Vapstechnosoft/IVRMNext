'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface MissingLog {
    id: number;
    employeeName: string;
    date: string;
    time: string;
    inOut: 'IN' | 'OUT';
    file?: string; // path/url placeholder
    remarks?: string;
    reportedBy?: string;
    status: 'Pending' | 'Approved' | 'Rejected';

    createdAt: Date;
}

interface MissingLogColumnsProps {
    onEdit: (row: MissingLog) => void;
    onDelete: (row: MissingLog) => void;
}

export const getMissingLogColumns = ({ onEdit, onDelete }: MissingLogColumnsProps): ColumnDef<MissingLog>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />
    },
    {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />
    },
    {
        accessorKey: 'time',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Time' />
    },
    {
        accessorKey: 'inOut',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Input/Output' />
    },
    {
        accessorKey: 'file',
        header: ({ column }) => <DataTableColumnHeader column={column} title='File' />,
        cell: ({ row }) => <div>{row.getValue('file') ? 'view' : '-'}</div>
    },
    {
        accessorKey: 'remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />
    },
    {
        accessorKey: 'reportedBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reported By' />
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const entity = row.original;
            return (
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' onClick={() => onEdit(entity)}>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='sm' className='text-red-600' onClick={() => onDelete(entity)}>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
