'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGroupType } from '@/hooks/hrms/useMasters';
import type { GroupTypeDetail, MasterGroupTypeResponse } from '@/types/hrms/master-group-type';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';
export const columns: ColumnDef<GroupTypeDetail>[] = [
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
        accessorKey: 'HRMGT_EmployeeGroupType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMGT_Code',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Code' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMGT_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const orderValue = row.original.HRMGT_Order;
            return <div>{orderValue ?? '-'}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];
function ActionButtonsCell({ rowData }: { rowData: GroupTypeDetail }) {
    const { openEditForm } = useFormContext<MasterGroupTypeResponse>();
    const { toggleMutation } = useMasterGroupType(HRMS_MI_ID);
    const handleEdit = useCallback(
        (data: GroupTypeDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );
    const handleToggle = useCallback(
        async (data: GroupTypeDetail, newState: boolean) => {
            try {
                const result = await toggleMutation.mutateAsync({
                    HRMGT_Id: data.HRMGT_Id,
                    HRMGT_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                // Check if the record is mapped/in use
                const retrunMsg = (result as any)?.retrunMsg || '';
                if (retrunMsg === 'Mapped') {
                    toast.error('Cannot deactivate - Group Type is currently assigned/in use');
                } else {
                    toast.success(`Group Type ${newState ? 'activated' : 'deactivated'} successfully`);
                }
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} group type`);
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
            toggleConditionKey='HRMGT_ActiveFlag'
        />
    );
}
