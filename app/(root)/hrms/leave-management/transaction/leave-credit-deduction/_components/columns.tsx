'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { type BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface LeaveCreditDeduction extends BaseEntity {
    leaveYear: string;
    employeeName: string;
    designation: string;
    department: string;
    leaveName: string;
    deductDays: number;
    remarks?: string;
}

export const leaveCreditDeductionColumns: ColumnDef<LeaveCreditDeduction>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
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
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div>{row.getValue('designation')}</div>
    },
    {
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.getValue('department')}</div>
    },
    {
        accessorKey: 'leaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div>{row.getValue('leaveName')}</div>
    },
    {
        accessorKey: 'deductDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Deduct Days' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('deductDays')}</div>
    },
    {
        accessorKey: 'remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => <div className='max-w-xs truncate text-sm'>{row.getValue('remarks') || '-'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: LeaveCreditDeduction }) {
    const { openEditForm } = useFormContext<LeaveCreditDeduction>();

    const handleEdit = useCallback(
        (data: LeaveCreditDeduction) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: false }}
            onEdit={handleEdit}
        />
    );
}
