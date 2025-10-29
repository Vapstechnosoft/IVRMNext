'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface GPSLog {
    id: number;
    employeeName: string;
    clientName: string;
    leadName: string;
    gpsDate: string; // date-time
    address: string;
    remarks?: string;

    createdAt: string;
}

interface GPSLogColumnsProps {
    onEdit: (row: GPSLog) => void;
    onDelete: (row: GPSLog) => void;
}

export const getGPSLogColumns = ({ onEdit, onDelete }: GPSLogColumnsProps): ColumnDef<GPSLog>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    // TODO: Add other columns based on the entity fields
    {
        id: 'actions',
        header: 'Action',
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
