'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasterLeaveYear';
import type { LeaveYearDetail, MasterLeaveYearResponse } from '@/types/hrms/master-leave-year';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<LeaveYearDetail>[] = [
    {
        accessorKey: 'HRMLY_LeaveYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Year' />
    },
    {
        accessorKey: 'HRMLY_FromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => new Date(row.getValue('HRMLY_FromDate')).toLocaleDateString()
    },
    {
        accessorKey: 'HRMLY_ToDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => new Date(row.getValue('HRMLY_ToDate')).toLocaleDateString()
    },
    {
        accessorKey: 'HRMLY_LeaveYearOrder',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
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
                await toggleMutation.mutateAsync({
                    HRMLY_Id: data.HRMLY_Id,
                    HRMLY_ActiveFlag: newState
                });
                toast.success(`Leave Year ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} leave year`);
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
            accessorKey: 'HRMLY_LeaveYear',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Year' />
        },
        {
            accessorKey: 'HRMLY_FromDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
            cell: ({ row }) => new Date(row.getValue('HRMLY_FromDate')).toLocaleDateString()
        },
        {
            accessorKey: 'HRMLY_ToDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
            cell: ({ row }) => new Date(row.getValue('HRMLY_ToDate')).toLocaleDateString()
        },
        {
            accessorKey: 'HRMLY_LeaveYearOrder',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMLY_LeaveYearOrder}
                    onChange={(e) => onOrderChange(row.original.HRMLY_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        }
    ];
}
