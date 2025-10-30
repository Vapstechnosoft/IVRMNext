'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface MasterShift {
    id: number;
    shiftName: string;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    remarks?: string;
    specificDay: boolean;
    createdAt: Date;
}

interface MasterShiftColumnsProps {
    onEdit: (row: MasterShift) => void;
    onDelete: (row: MasterShift) => void;
}

export const getMasterShiftColumns = ({ onEdit, onDelete }: MasterShiftColumnsProps): ColumnDef<MasterShift>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'shiftName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Name' />
    },
    {
        accessorKey: 'startTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Start Time' />
    },
    {
        accessorKey: 'endTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Shift End Time' />
    },
    {
        accessorKey: 'specificDay',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Specific Day' />,
        cell: ({ row }) => <div>{row.getValue('specificDay') ? 'True' : 'False'}</div>
    },
    {
        accessorKey: 'remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const shift = row.original;
            return (
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' onClick={() => onEdit(shift)}>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='sm' className='text-red-600' onClick={() => onDelete(shift)}>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
