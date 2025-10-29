'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface LeaveCreditTransaction {
    id: number;
    type: string[];
    department: string[];
    designation: string[];
    leaveYear: string;
    fromDate?: string;
    toDate?: string;
    employee?: string;
    lossOfPay: boolean;
    leaveName: string;
    availed: number;

    createdAt: string;
}

interface LeaveCreditTransactionColumnsProps {
    onEdit: (row: LeaveCreditTransaction) => void;
    onDelete: (row: LeaveCreditTransaction) => void;
}

export const getLeaveCreditTransactionColumns = ({
    onEdit,
    onDelete
}: LeaveCreditTransactionColumnsProps): ColumnDef<LeaveCreditTransaction>[] => [
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
