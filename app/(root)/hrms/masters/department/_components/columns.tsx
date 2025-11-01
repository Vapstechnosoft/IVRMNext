'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterDepartment } from '@/hooks/hrms/useMasters';
import type { DepartmentDetail, MasterDepartmentResponse } from '@/types/hrms/master-department';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<DepartmentDetail>[] = [
    {
        accessorKey: 'HRMD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />
    },
    {
        accessorKey: 'HRMD_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />
    },
    {
        accessorKey: 'HRMD_InternalTrainingMinimumHrs',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Training Hours' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: DepartmentDetail }) {
    const { openEditForm } = useFormContext<MasterDepartmentResponse>();
    const { toggleMutation } = useMasterDepartment(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: DepartmentDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: DepartmentDetail, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    HRMD_Id: data.HRMD_Id,
                    HRMD_ActiveFlag: newState
                });
                toast.success(`Department ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} department`);
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
            toggleConditionKey='HRMD_ActiveFlag'
        />
    );
}

// Editable columns for order editing mode
export function getEditableColumns(onOrderChange: (rowId: number, newOrder: number) => void): ColumnDef<DepartmentDetail>[] {
    return [
        {
            accessorKey: 'HRMD_DepartmentName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />
        },
        {
            accessorKey: 'HRMD_Order',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMD_Order}
                    onChange={(e) => onOrderChange(row.original.HRMD_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        },
        {
            accessorKey: 'HRMD_InternalTrainingMinimumHrs',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Training Hours' />
        }
    ];
}
