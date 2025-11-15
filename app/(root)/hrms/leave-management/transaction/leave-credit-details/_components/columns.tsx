'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export interface LeaveCreditDetail extends BaseEntity {
    type: string[];
    department: string[];
    designation: string[];
    leaveName: string;
    leaveCode?: string;
    noOfDays?: number;
    leaveCarryForward?: boolean;
    leaveEncashment?: boolean;
    leaveCreditMonthWise?: boolean;
    months: Record<string, number>;
}

export const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

interface LeaveCreditDetailColumnsProps {
    onEdit: (row: LeaveCreditDetail) => void;
    onDelete: (id: number) => void;
}

export const getLeaveCreditDetailColumns = ({
    onEdit,
    onDelete
}: LeaveCreditDetailColumnsProps): ColumnDef<LeaveCreditDetail>[] => [
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'leaveCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Code' />,
        cell: ({ row }) => <div>{row.getValue('leaveCode') || '-'}</div>
    },
    ...MONTHS.map((m) => ({
        accessorKey: `months.${m}`,
        header: ({ column }: { column: any }) => <DataTableColumnHeader column={column} title={m} />,
        cell: ({ row }: { row: any }) => {
            const months = row.original.months || {};
            return <div className='text-center'>{months[m] || 0}</div>;
        }
    })),
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
