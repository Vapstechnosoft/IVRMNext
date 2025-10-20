'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';

import type { IMasterFeesInstallmentDueDateList } from '@/types/fees/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterInstallmentDueDateColumns: ColumnDef<IMasterFeesInstallmentDueDateList>[] = [
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
        accessorKey: 'fmI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('fmI_Name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmI_Installment_Type',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment Type' />,
        cell: ({ row }) => <div className='capitalize'>{row.getValue('fmI_Installment_Type')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmI_No_Of_Installments',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No. of Installments' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('fmI_No_Of_Installments')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmI_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('fmI_ActiveFlag');
            return (
                <div className='flex items-center'>
                    <span
                        className={`inline-flex rounded-full px-2 py-1 font-semibold text-xs ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterFeesInstallmentDueDateList;
}) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterFeesInstallmentDueDateList>();

    const handleEdit = useCallback(
        (data: IMasterFeesInstallmentDueDateList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterFeesInstallmentDueDateList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='fmI_ActiveFlag'
        />
    );
}
