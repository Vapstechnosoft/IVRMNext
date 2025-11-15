'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface InterviewRecord {
    id: number;
    candidateName: string;
    interviewRound: string;
    interviewType: string;
    interviewDate: string;
    interviewVenue: string;
    interviewFeedback: string;
    candidateStatus: 'Short Listed' | 'Selected' | 'Rejected' | 'In Progress';

    createdAt: string;
}

interface InterviewRecordColumnsProps {
    onEdit: (row: InterviewRecord) => void;
    onDelete: (row: InterviewRecord) => void;
}

export const getInterviewRecordColumns = ({ onEdit, onDelete }: InterviewRecordColumnsProps): ColumnDef<InterviewRecord>[] => [
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
