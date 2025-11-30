'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEmployeeType } from '@/hooks/hrms/useMasters';
import type { EmployeeTypeDetail, MasterEmployeeTypeResponse } from '@/types/hrms/master-employee-type';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';
export const columns: ColumnDef<EmployeeTypeDetail>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'HRMET_EmployeeType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Type' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];
function ActionButtonsCell({ rowData }: { rowData: EmployeeTypeDetail }) {
    const { openEditForm } = useFormContext<MasterEmployeeTypeResponse>();
    const { toggleMutation } = useMasterEmployeeType(HRMS_MI_ID);
    const handleEdit = useCallback(
        (data: EmployeeTypeDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );
    const handleToggle = useCallback(
        async (data: EmployeeTypeDetail, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    HRMET_Id: data.HRMET_Id,
                    HRMET_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                toast.success(`Employee Type ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} employee type`);
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
            toggleConditionKey='HRMET_ActiveFlag'
        />
    );
}
