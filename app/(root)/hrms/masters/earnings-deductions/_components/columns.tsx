'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasterEarningsDeductions';
import type { EarningsDeductionDetail, MasterEarningsDeductionsResponse } from '@/types/hrms/master-earnings-deductions';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<EarningsDeductionDetail>[] = [
    {
        accessorKey: 'HRMED_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />
    },
    {
        accessorKey: 'HRMED_EarnDedFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
        cell: ({ row }) => (row.getValue('HRMED_EarnDedFlag') === 'E' ? 'Earning' : 'Deduction')
    },
    {
        accessorKey: 'HRMED_AmountPercentFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount/Percent' />
    },
    {
        accessorKey: 'HRMED_AmountPercent',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Value' />
    },
    {
        accessorKey: 'HRMED_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: EarningsDeductionDetail }) {
    const { openEditForm } = useFormContext<MasterEarningsDeductionsResponse>();
    const { toggleActiveMutation } = useMasterEarningsDeductions(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: EarningsDeductionDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: EarningsDeductionDetail, newState: boolean) => {
            try {
                await toggleActiveMutation.mutateAsync({
                    HRMED_Id: data.HRMED_Id,
                    HRMED_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                toast.success(`Earnings/Deduction ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} earnings/deduction`);
            }
        },
        [toggleActiveMutation]
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

export function getEditableColumns(onOrderChange: (rowId: number, newOrder: number) => void): ColumnDef<EarningsDeductionDetail>[] {
    return [
        {
            accessorKey: 'HRMED_Name',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />
        },
        {
            accessorKey: 'HRMED_EarnDedFlag',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
            cell: ({ row }) => (row.getValue('HRMED_EarnDedFlag') === 'E' ? 'Earning' : 'Deduction')
        },
        {
            accessorKey: 'HRMED_AmountPercentFlag',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Amount/Percent' />
        },
        {
            accessorKey: 'HRMED_AmountPercent',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Value' />
        },
        {
            accessorKey: 'HRMED_Order',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMED_Order}
                    onChange={(e) => onOrderChange(row.original.HRMED_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        }
    ];
}
