'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LeaveCreditTransaction extends BaseEntity {
    type: string[];
    department: string[];
    designation: string[];
    leaveYear: string;
    fromDate?: string;
    toDate?: string;
    totalDays?: number;
    employee?: string;
    lossOfPay?: boolean;
    lossOfPayType?: 'none' | 'full' | 'half' | 'oneFourth' | 'threeFourth';
    lossOfPayAmount?: number;
    leaveName: string;
    availed: number;
}

interface LeaveCreditTransactionColumnsProps {
    onEdit: (row: LeaveCreditTransaction) => void;
    onDelete: (id: number) => void;
}

export const getLeaveCreditTransactionColumns = ({
    onEdit,
    onDelete
}: LeaveCreditTransactionColumnsProps): ColumnDef<LeaveCreditTransaction>[] => [
    {
        accessorKey: 'leaveYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Year' />,
        cell: ({ row }) => <div>{row.getValue('leaveYear')}</div>
    },
    {
        accessorKey: 'employee',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('employee') || '-'}</div>
    },
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'availed',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Availed' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('availed')}</div>
    },
    {
        accessorKey: 'fromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => {
            const date = row.getValue('fromDate') as string;
            return <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>;
        }
    },
    {
        accessorKey: 'toDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => {
            const date = row.getValue('toDate') as string;
            return <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>;
        }
    },
    {
        accessorKey: 'lossOfPay',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loss of Pay' />,
        cell: ({ row }) => {
            const lossOfPay = row.getValue('lossOfPay') as boolean;
            return (
                <span
                    className={cn(
                        'inline-flex rounded-full px-2 py-1 font-medium text-xs',
                        lossOfPay ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    )}>
                    {lossOfPay ? 'Yes' : 'No'}
                </span>
            );
        }
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
