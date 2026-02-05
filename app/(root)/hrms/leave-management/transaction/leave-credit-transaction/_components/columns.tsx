'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
export interface LeaveCreditTransaction extends BaseEntity {
    type: string[];
    department: string[];
    designation: string[];
    leaveYear: string;
    fromDate: string;
    toDate: string;
    totalDays: number;
    employee: string;
    lossOfPayType: 'none' | 'full' | 'half' | 'oneFourth' | 'threeFourth';
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
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SNO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{continuousIndex}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'employee',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('employee') || '-'}</div>
    },
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'fromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => {
            const date = row.getValue('fromDate') as string;
            if (!date) return <div>-</div>;
            const dateObj = new Date(date);
            return <div>{dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>;
        }
    },
    {
        accessorKey: 'toDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => {
            const date = row.getValue('toDate') as string;
            if (!date) return <div>-</div>;
            const dateObj = new Date(date);
            return <div>{dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>;
        }
    },
    {
        accessorKey: 'availed',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Availed' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('availed')}</div>
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
