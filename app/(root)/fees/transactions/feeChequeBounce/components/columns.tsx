'use client';

import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

export const feeChequeBounceColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'slno',
        header: 'SLNO',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'asmaY_Year',
        header: 'Academic Year'
    },
    {
        accessorKey: 'asmaY_From_Date',
        header: 'From Date',
        cell: ({ row }) => {
            const date = row.original.asmaY_From_Date;
            return date ? format(new Date(date), 'dd-MM-yyyy') : '-';
        }
    },
    {
        accessorKey: 'asmaY_To_Date',
        header: 'To Date',
        cell: ({ row }) => {
            const date = row.original.asmaY_To_Date;
            return date ? format(new Date(date), 'dd-MM-yyyy') : '-';
        }
    },
    {
        accessorKey: 'asmaY_AcademicYearCode',
        header: 'Year Code'
    },
    {
        accessorKey: 'is_Active',
        header: 'Status',
        cell: ({ row }) => (
            <span
                className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${row.original.is_Active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {row.original.is_Active ? 'Active' : 'Inactive'}
            </span>
        )
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <ActionButtons row={row.original} />
    }
];

function ActionButtons({ row }: { row: any }) {
    const { openDeleteForm } = useFormContext<any>();

    return (
        <div className='flex items-center justify-center gap-2'>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => openDeleteForm(row)}
                className='h-8 w-8 text-destructive hover:bg-destructive/10'
                title='Delete'>
                <Trash2 className='h-4 w-4' />
            </Button>
        </div>
    );
}
