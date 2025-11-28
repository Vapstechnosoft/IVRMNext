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
        accessorKey: 'HRMD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMD_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const orderValue = row.original.HRMD_Order;
            return <div>{orderValue ?? '-'}</div>;
        }
    },
    {
        accessorKey: 'HRMD_InternalTrainingMinimumHrs',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Training Hours' className='whitespace-nowrap' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
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
                const response = await toggleMutation.mutateAsync({
                    HRMD_Id: data.HRMD_Id,
                    HRMD_ActiveFlag: newState
                });

                // Check the response success status
                if (response?.success) {
                    // Check if the record is mapped/in use
                    const retrunMsg = response?.data?.retrunMsg || response?.data?.data?.retrunMsg || '';

                    if (retrunMsg === 'Mapped') {
                        toast.error('Cannot deactivate - Department is currently assigned/in use');
                    } else {
                        // Show the actual message from the API response
                        toast.success(response.message || `Department ${newState ? 'activated' : 'deactivated'} successfully`);
                    }
                } else {
                    // Show the error message from the API response
                    const errorMessage = response?.message || `Failed to ${newState ? 'activate' : 'deactivate'} department`;
                    toast.error(errorMessage);
                }
            } catch (error: any) {
                // Handle actual errors (network errors, etc.)
                const errorMessage =
                    error?.response?.data?.message || error?.message || `Failed to ${newState ? 'activate' : 'deactivate'} department`;
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
            toggleConditionKey='HRMD_ActiveFlag'
        />
    );
}

// Editable columns for order editing mode
export function getEditableColumns(onOrderChange: (rowId: number, newOrder: number) => void): ColumnDef<DepartmentDetail>[] {
    return [
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
            accessorKey: 'HRMD_DepartmentName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Department' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMD_Order',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMD_Order ?? 0}
                    onChange={(e) => onOrderChange(row.original.HRMD_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        },
        {
            accessorKey: 'HRMD_InternalTrainingMinimumHrs',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Training Hours' className='whitespace-nowrap' />
        }
    ];
}
