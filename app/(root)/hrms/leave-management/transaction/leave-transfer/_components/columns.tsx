'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface LeaveCredit extends BaseEntity {
    leaveYear: string;
    leaveName: string;
    employeeName: string;
    leaveCredit: number;
    leaveBalance: number;
    type: string[];
    department: string[];
    designation: string[];
}

interface LeaveCreditColumnsProps {
    onEdit: (row: LeaveCredit) => void;
    onDelete: (id: number) => void;
}

export const getLeaveCreditColumns = ({
    onEdit,
    onDelete
}: LeaveCreditColumnsProps): ColumnDef<LeaveCredit>[] => [
    {
        accessorKey: 'leaveYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Year' />,
        cell: ({ row }) => <div>{row.getValue('leaveYear')}</div>
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeName')}</div>
    },
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'leaveCredit',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Transfer' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('leaveCredit')}</div>
    },
    {
        accessorKey: 'leaveBalance',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Balance' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('leaveBalance')}</div>
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const entity = row.original;
            return (
                <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={() => onEdit(entity)}>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => onDelete(entity.id)}>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
