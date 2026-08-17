'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IStudentFeeEnablePartialPaymentList } from '@/types/fees/transactions/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { format, isValid } from 'date-fns';
import { useCallback } from 'react';

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return isValid(date) ? format(date, 'dd/MM/yyyy') : dateStr;
};

export const studentFeeEnablePartialPaymentColumns: ColumnDef<IStudentFeeEnablePartialPaymentList>[] = [
    {
        accessorKey: 'fsepP_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex || 0;
            const pageSize = table.getState().pagination.pageSize || 10;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='px-4 py-2 font-medium'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'amsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.getValue('amsT_FirstName') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fsepP_RemarksDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Entry Date' className='font-bold text-black' />,
        cell: ({ row }) => <div>{formatDate(row.getValue('fsepP_RemarksDate'))}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fsepP_Remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' className='font-bold text-black' />,
        cell: ({ row }) => <div className='max-w-[300px] truncate' title={row.getValue('fsepP_Remarks')}>{row.getValue('fsepP_Remarks') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='font-bold text-black text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IStudentFeeEnablePartialPaymentList }) {
    const { openToggleForm } = useFormContext<IStudentFeeEnablePartialPaymentList>();

    const handleToggle = useCallback(
        (data: IStudentFeeEnablePartialPaymentList) => {
            openToggleForm?.(data);
        },
        [openToggleForm]
    );

    return (
        <div className='flex justify-center'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: false, toggle: true, delete: false }}
                onToggle={handleToggle}
                toggleConditionKey='fsepP_ActiveFlag'
            />
        </div>
    );
}
