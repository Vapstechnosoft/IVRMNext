'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IFeeChequeBounceGrid } from '@/types/fees/transactions/feeChequeBounce';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useFormContext } from '@/components/ui/form/form-provider';

export const feeChequeBounceColumns: ColumnDef<IFeeChequeBounceGrid>[] = [
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
        accessorKey: 'fcB_DATE',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.original.fcB_DATE), 'dd-MM-yyyy')
    },
    {
        id: 'studentName',
        header: 'Student Name',
        cell: ({ row }) => {
            const { amsT_FirstName, amsT_MiddleName, amsT_LastName } = row.original;
            return `${amsT_FirstName} ${amsT_MiddleName || ''} ${amsT_LastName || ''}`.trim();
        }
    },
    {
        accessorKey: 'fyP_Receipt_No',
        header: 'Receipt No'
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <ActionButtons row={row.original} />
    }
];

function ActionButtons({ row }: { row: IFeeChequeBounceGrid }) {
    const { openDeleteForm } = useFormContext<IFeeChequeBounceGrid>();

    return (
        <div className='flex items-center justify-center gap-2'>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => openDeleteForm(row)}
                className='h-8 w-8 text-destructive hover:bg-destructive/10'
                title='Delete'
            >
                <Trash2 className='h-4 w-4' />
            </Button>
        </div>
    );
}
