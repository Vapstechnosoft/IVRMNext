'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasters';
import type { EarningsDeductionDetail, MasterEarningsDeductionsResponse } from '@/types/hrms/master-earnings-deductions';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

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
            const badgeClass = value === 'Earning' 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : value === 'Deduction'
                ? 'bg-red-100 text-red-800 border-red-200'
                : value === 'Arrear'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-purple-100 text-purple-800 border-purple-200';
            return (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
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
    const { openEditForm } = useFormContext<MasterEarningsDeductionsResponse>();
    const { toggleMutation } = useMasterEarningsDeductions(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: EarningsDeductionDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: EarningsDeductionDetail, newState: boolean) => {
            console.log('🔵 [TOGGLE] handleToggle called');
            console.log('🔵 [TOGGLE] Record ID:', data.HRMED_Id);
            console.log('🔵 [TOGGLE] Record Name:', data.HRMED_Name);
            console.log('🔵 [TOGGLE] Current State:', data.HRMED_ActiveFlag);
            console.log('🔵 [TOGGLE] New State:', newState);
            console.log('🔵 [TOGGLE] MI_Id:', HRMS_MI_ID);
            
            try {
                console.log('🟡 [TOGGLE] Calling toggleMutation.mutateAsync...');
                const result = await toggleMutation.mutateAsync({
                    HRMED_Id: data.HRMED_Id,
                    HRMED_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                
                console.log('🟢 [TOGGLE] Toggle result:', result);
                
                if (result?.success) {
                    const successMsg = result?.message || `Earnings/Deduction ${newState ? 'activated' : 'deactivated'} successfully`;
                    console.log('✅ [TOGGLE] Success! Message:', successMsg);
                    toast.success(successMsg);
                } else {
                    const errorMsg = result?.message || `Failed to ${newState ? 'activate' : 'deactivate'} earnings/deduction`;
                    console.log('❌ [TOGGLE] Failed. Message:', errorMsg);
                    toast.error(errorMsg);
                }
            } catch (error: any) {
                console.log('🔴 [TOGGLE] Error caught');
                console.error('🔴 [TOGGLE] Error:', error);
                console.error('🔴 [TOGGLE] Error message:', error?.message);
                
                const errorMsg = error?.response?.data?.message 
                    || error?.message 
                    || `Failed to ${newState ? 'activate' : 'deactivate'} earnings/deduction`;
                
                console.log('🔴 [TOGGLE] Showing error toast:', errorMsg);
                toast.error(errorMsg);
            }
        },
        [toggleMutation]
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
                const badgeClass = value === 'Earning' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : value === 'Deduction'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : value === 'Arrear'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-purple-100 text-purple-800 border-purple-200';
                return (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
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
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMED_Order ?? 0}
                    onChange={(e) => onOrderChange(row.original.HRMED_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        }
    ];
}
