'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLoan } from '@/hooks/hrms/useMasters';
import type { MasterLoanDetail, MasterLoanResponse } from '@/types/hrms/master-loan';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<MasterLoanDetail>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'HRML_LoanType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Type' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRML_Max',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Maximum Amount' className='whitespace-nowrap' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: MasterLoanDetail }) {
    const { openEditForm } = useFormContext<MasterLoanResponse>();
    const { toggleMutation } = useMasterLoan(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: MasterLoanDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: MasterLoanDetail, newState: boolean) => {
            try {
                const response = await toggleMutation.mutateAsync({
                    HRMLN_Id: data.HRMLN_Id,
                    HRMLN_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });

                // Check the response success status
                if (response?.success) {
                    // Show the actual message from the API response
                    toast.success(response.message || `Loan ${newState ? 'activated' : 'deactivated'} successfully`);
                } else {
                    // Show the error message from the API response
                    const errorMessage = response?.message || `Failed to ${newState ? 'activate' : 'deactivate'} loan`;
                    toast.error(errorMessage);
                }
            } catch (error: any) {
                // Handle actual errors (network errors, etc.)
                const errorMessage =
                    error?.response?.data?.message || error?.message || `Failed to ${newState ? 'activate' : 'deactivate'} loan`;
                toast.error(errorMessage);
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
            toggleConditionKey='HRMLN_ActiveFlag'
        />
    );
}
