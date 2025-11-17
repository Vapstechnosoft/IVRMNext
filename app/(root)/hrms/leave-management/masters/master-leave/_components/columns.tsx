'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, Edit, Trash2, X } from 'lucide-react';

export interface MasterLeave extends BaseEntity {
    leaveName: string;
    leaveCode: string;
    leaveType: string;
    leaveApplyCriteria: string;
    daysForApplyCriteria: string;
    maxDaysForApply: string;
    leaveDetails: string;
    leaveCredit: boolean;
    lateDeduct: boolean;
    probationNotApplicable: boolean;
    leaveOrder: number;
    isActive: boolean;
}

export type Leave = MasterLeave;

interface MasterLeaveColumnsProps {
    onEdit: (row: MasterLeave) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (row: MasterLeave) => void;
}

export const getMasterLeaveColumns = ({
    onEdit,
    onDelete,
    onToggleStatus
}: MasterLeaveColumnsProps): ColumnDef<MasterLeave>[] => [
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'leaveCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Code' />,
        cell: ({ row }) => <div>{row.getValue('leaveCode')}</div>
    },
    {
        accessorKey: 'leaveType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Type' />,
        cell: ({ row }) => <div>{row.getValue('leaveType')}</div>
    },
    {
        accessorKey: 'leaveOrder',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Order' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('leaveOrder')}</div>
    },
    {
        accessorKey: 'leaveCredit',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Credit' />,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                {row.original.leaveCredit ? <Check className='h-4 w-4 text-green-600' /> : <X className='h-4 w-4 text-red-600' />}
            </div>
        )
    },
    {
        accessorKey: 'lateDeduct',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Deduct' />,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                {row.original.lateDeduct ? <Check className='h-4 w-4 text-green-600' /> : <X className='h-4 w-4 text-red-600' />}
            </div>
        )
    },
    {
        accessorKey: 'probationNotApplicable',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Probation' />,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                {row.original.probationNotApplicable ? (
                    <Check className='h-4 w-4 text-green-600' />
                ) : (
                    <X className='h-4 w-4 text-red-600' />
                )}
            </div>
        )
    },
    {
        id: 'actions',
        header: 'Action',
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
                    <Button
                        variant={entity.isActive ? 'destructive' : 'default'}
                        size='sm'
                        onClick={() => onToggleStatus(entity)}>
                        {entity.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>
            );
        }
    }
];
