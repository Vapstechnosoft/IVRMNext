'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGender } from '@/hooks/hrms/useMasterGender';
import type { GenderItem, MasterGenderResponse } from '@/types/hrms/master-gender';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<GenderItem>[] = [
    {
        accessorKey: 'IVRMMG_GenderName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: GenderItem }) {
    const { openEditForm } = useFormContext<MasterGenderResponse>();
    const { toggleMutation } = useMasterGender(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: GenderItem) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: GenderItem, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    IVRMMG_Id: data.IVRMMG_Id,
                    IVRMMG_ActiveFlag: newState,
                    roleId: HRMS_MI_ID
                });
                toast.success(`Gender ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} gender`);
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
            toggleConditionKey='IVRMMG_ActiveFlag'
        />
    );
}
