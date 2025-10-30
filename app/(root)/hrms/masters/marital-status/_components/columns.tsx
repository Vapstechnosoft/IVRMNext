'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterMaritalStatus } from '@/hooks/hrms/useMasterMaritalStatus';
import type { MaritalStatusDetail, MasterMaritalStatusResponse } from '@/types/hrms/master-marital-status';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<MaritalStatusDetail>[] = [
    {
        accessorKey: 'IVRMMMS_MaritalStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Marital Status' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: MaritalStatusDetail }) {
    const { openEditForm } = useFormContext<MasterMaritalStatusResponse>();
    const { toggleMutation } = useMasterMaritalStatus(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: MaritalStatusDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: MaritalStatusDetail, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    IVRMMMS_Id: data.IVRMMMS_Id,
                    IVRMMMS_ActiveFlag: newState,
                    roleId: HRMS_MI_ID
                });
                toast.success(`Marital Status ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} marital status`);
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
            toggleConditionKey='IVRMMMS_ActiveFlag'
        />
    );
}
