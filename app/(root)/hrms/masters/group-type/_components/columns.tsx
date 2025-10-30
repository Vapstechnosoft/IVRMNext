'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGroupType } from '@/hooks/hrms/useMasterGroupType';
import type { GroupTypeDetail, MasterGroupTypeResponse } from '@/types/hrms/master-group-type';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<GroupTypeDetail>[] = [
    {
        accessorKey: 'HRMGT_EmployeeGroupType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type' />
    },
    {
        accessorKey: 'HRMGT_Code',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />
    },
    {
        accessorKey: 'HRMGT_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
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
                await toggleMutation.mutateAsync({
                    HRMGT_Id: data.HRMGT_Id,
                    HRMGT_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                toast.success(`Group Type ${newState ? 'activated' : 'deactivated'} successfully`);
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

export function getEditableColumns(onOrderChange: (rowId: number, newOrder: number) => void): ColumnDef<GroupTypeDetail>[] {
    return [
        {
            accessorKey: 'HRMGT_EmployeeGroupType',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type' />
        },
        {
            accessorKey: 'HRMGT_Code',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />
        },
        {
            accessorKey: 'HRMGT_Order',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMGT_Order}
                    onChange={(e) => onOrderChange(row.original.HRMGT_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        }
    ];
}
