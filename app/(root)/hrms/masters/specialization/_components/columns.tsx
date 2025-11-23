'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterSpecialization } from '@/hooks/hrms/useMasters';
import type { MasterSpecializationResponse, SpecializationItem } from '@/types/hrms/master-specialization';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<SpecializationItem>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 60
    },
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
    const { toggleMutation } = useMasterSpecialization(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: SpecializationItem) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: SpecializationItem, newState: boolean) => {
            try {
                const res = await toggleMutation.mutateAsync({
                    HRMSPL_Id: data.HRMSPL_Id,
                    HRMSPL_ActiveFlg: newState,
                    MI_Id: HRMS_MI_ID
                });
                if (res?.success) {
                    toast.success(res?.message || `Specialization ${newState ? 'activated' : 'deactivated'} successfully`);
                } else {
                    toast.error(res?.message || `Failed to ${newState ? 'activate' : 'deactivate'} specialization`);
                }
            } catch (error: any) {
                const errorMessage =
                    error?.response?.data?.message || error?.message || `Failed to ${newState ? 'activate' : 'deactivate'} specialization`;
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
            toggleConditionKey='HRMSPL_ActiveFlg'
        />
    );
}
