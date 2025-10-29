'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface CompOffApproval {
    id: number;
    employeeName: string;
    date: string;
    time: string;
    compOffToBeCredit: number;
    reason: string;
    hrStatus: 'Pending' | 'Approved' | 'Rejected';
    approverRemarks?: string;
    remark?: string;

    createdAt: string;
}

interface CompOffApprovalColumnsProps {
    onEdit: (row: CompOffApproval) => void;
    onDelete: (row: CompOffApproval) => void;
}

export const getCompOffApprovalColumns = ({ onEdit, onDelete }: CompOffApprovalColumnsProps): ColumnDef<CompOffApproval>[] => [
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
