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
        accessorKey: 'HRML_LoanType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Type' />
    },
    {
        accessorKey: 'HRML_Max',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Maximum Amount' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
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
                await toggleMutation.mutateAsync({
                    HRMLN_Id: data.HRMLN_Id,
                    HRMLN_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                toast.success(`Loan ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} loan`);
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
