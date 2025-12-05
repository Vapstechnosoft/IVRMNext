'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { EarningsDeductionDetail } from '@/types/hrms/master-earnings-deductions';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
export const columns: ColumnDef<EarningsDeductionDetail>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'HRMED_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMED_EDTypeFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Type' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMED_EarnDedFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const value = row.getValue('HRMED_EarnDedFlag') as string;
            const badgeClass =
                value === 'Earning'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : value === 'Deduction'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : value === 'Arrear'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-purple-100 text-purple-800 border-purple-200';
            return (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs ${badgeClass}`}>
                    {value}
                </span>
            );
        }
    },
    {
        accessorKey: 'HRMED_AmountPercentFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount Type' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMED_AmountPercent',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Value' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMED_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
        cell: ({ row }) => row.original.HRMED_Order ?? '-'
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];
function ActionButtonsCell({ rowData }: { rowData: EarningsDeductionDetail }) {
    const { openEditForm, openToggleForm } = useFormContext<EarningsDeductionDetail>();

    const handleEdit = useCallback(
        (data: EarningsDeductionDetail) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: EarningsDeductionDetail) => {
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
            toggleConditionKey='HRMED_ActiveFlag'
        />
    );
}
