'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface LeaveCarryForward extends BaseEntity {
    leaveYear: string;
    leaveName: string;
    employeeName: string;
    leaveCredit: number;
    leaveBalance: number;
    type: string[];
    department: string[];
    designation: string[];
}

interface LeaveCarryForwardColumnsProps {
    onEdit: (row: LeaveCarryForward) => void;
    onDelete: (id: number) => void;
}

export const getLeaveCarryForwardColumns = ({
    onEdit,
    onDelete
}: LeaveCarryForwardColumnsProps): ColumnDef<LeaveCarryForward>[] => [
    {
        accessorKey: 'fromYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Year' />,
        cell: ({ row }) => <div>{row.getValue('fromYear')}</div>
    },
    {
        accessorKey: 'toYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Year' />,
        cell: ({ row }) => <div>{row.getValue('toYear')}</div>
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeName')}</div>
    },
    {
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.getValue('department')}</div>
    },
    {
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div>{row.getValue('designation')}</div>
    },
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'carryDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Carry Days' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('carryDays')}</div>
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
