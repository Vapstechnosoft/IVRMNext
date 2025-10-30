'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterProfessionalTax } from '@/hooks/hrms/useMasterProfessionalTax';
import type { MasterProfessionalTaxResponse, ProfessionalTaxDetail } from '@/types/hrms/master-professional-tax';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<ProfessionalTaxDetail>[] = [
    {
        accessorKey: 'HRMPT_SalaryFrom',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Salary From' />
    },
    {
        accessorKey: 'HRMPT_SalaryTo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Salary To' />
    },
    {
        accessorKey: 'HRMPT_PTax',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Professional Tax' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: ProfessionalTaxDetail }) {
    const { openEditForm } = useFormContext<MasterProfessionalTaxResponse>();
    const { toggleMutation } = useMasterProfessionalTax(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: ProfessionalTaxDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: ProfessionalTaxDetail, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    HRMPT_Id: data.HRMPT_Id,
                    HRMPT_ActiveFlag: newState,
                    roleId: HRMS_MI_ID
                });
                toast.success(`Professional Tax ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} professional tax`);
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
            toggleConditionKey='HRMPT_ActiveFlag'
        />
    );
}
