'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterSpecialization } from '@/hooks/hrms/useMasterSpecialization';
import type { MasterSpecializationResponse, SpecializationItem } from '@/types/hrms/master-specialization';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<SpecializationItem>[] = [
    {
        accessorKey: 'HRMSPL_SpecialisationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Specialization' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: SpecializationItem }) {
    const { openEditForm } = useFormContext<MasterSpecializationResponse>();
    const { toggleActiveMutation } = useMasterSpecialization(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: SpecializationItem) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: SpecializationItem, newState: boolean) => {
            try {
                await toggleActiveMutation.mutateAsync({
                    HRMSPL_Id: data.HRMSPL_Id,
                    HRMSPL_ActiveFlg: newState,
                    MI_Id: HRMS_MI_ID
                });
                toast.success(`Specialization ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} specialization`);
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
            toggleConditionKey='HRMSPL_ActiveFlg'
        />
    );
}
