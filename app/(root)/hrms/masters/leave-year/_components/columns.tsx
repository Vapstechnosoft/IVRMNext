'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasters';
import type { LeaveYearDetail, MasterLeaveYearResponse } from '@/types/hrms/master-leave-year';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<LeaveYearDetail>[] = [
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
        accessorKey: 'HRMLY_LeaveYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Year' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMLY_FromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' className='whitespace-nowrap' />,
        cell: ({ row }) => new Date(row.getValue('HRMLY_FromDate')).toLocaleDateString()
    },
    {
        accessorKey: 'HRMLY_ToDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' className='whitespace-nowrap' />,
        cell: ({ row }) => new Date(row.getValue('HRMLY_ToDate')).toLocaleDateString()
    },
    {
        accessorKey: 'HRMLY_LeaveYearOrder',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const orderValue = row.original.HRMLY_LeaveYearOrder;
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

function ActionButtonsCell({ rowData }: { rowData: LeaveYearDetail }) {
    const { openEditForm } = useFormContext<MasterLeaveYearResponse>();
    const { toggleMutation } = useMasterLeaveYear(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: LeaveYearDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: LeaveYearDetail, newState: boolean) => {
            try {
                const response = await toggleMutation.mutateAsync({
                    HRMLY_Id: data.HRMLY_Id,
                    HRMLY_ActiveFlag: newState
                });

                // Check the response success status
                if (response?.success) {
                    toast.success(response.message || `Leave Year ${newState ? 'activated' : 'deactivated'} successfully`);
                } else {
                    // Show the error message from the API response
                    const errorMessage = response?.message || `Failed to ${newState ? 'activate' : 'deactivate'} leave year`;
                    toast.error(errorMessage);
                }
            } catch (error: any) {
                // Handle actual errors (network errors, etc.)
                const errorMessage =
                    error?.response?.data?.message || error?.message || `Failed to ${newState ? 'activate' : 'deactivate'} leave year`;
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
            toggleConditionKey='HRMLY_ActiveFlag'
        />
    );
}

export function getEditableColumns(onOrderChange: (rowId: number, newOrder: number) => void): ColumnDef<LeaveYearDetail>[] {
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
            accessorKey: 'HRMLY_LeaveYear',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Year' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMLY_FromDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' className='whitespace-nowrap' />,
            cell: ({ row }) => new Date(row.getValue('HRMLY_FromDate')).toLocaleDateString()
        },
        {
            accessorKey: 'HRMLY_ToDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' className='whitespace-nowrap' />,
            cell: ({ row }) => new Date(row.getValue('HRMLY_ToDate')).toLocaleDateString()
        },
        {
            accessorKey: 'HRMLY_LeaveYearOrder',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMLY_LeaveYearOrder ?? 0}
                    onChange={(e) => {
                        const newValue = Number.parseInt(e.target.value) || 0;
                        onOrderChange(row.original.HRMLY_Id, newValue);
                    }}
                    className='w-20'
                    min='0'
                />
            )
        }
    ];
}
