'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterDesignation } from '@/hooks/hrms/useMasterDesignation';
import type { DesignationDetail, MasterDesignationResponse } from '@/types/hrms/master-designation';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<DesignationDetail>[] = [
    {
        accessorKey: 'HRMDES_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />
    },
    {
        accessorKey: 'HRMDES_BasicAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Basic Amount' />
    },
    {
        accessorKey: 'HRMDES_SanctionedSeats',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sanctioned Seats' />
    },
    {
        accessorKey: 'HRMDES_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: DesignationDetail }) {
    const { openEditForm } = useFormContext<MasterDesignationResponse>();
    const { toggleMutation } = useMasterDesignation(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: DesignationDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: DesignationDetail, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    HRMDES_Id: data.HRMDES_Id,
                    HRMDES_ActiveFlag: newState
                });
                toast.success(`Designation ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} designation`);
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
            toggleConditionKey='HRMDES_ActiveFlag'
        />
    );
}

export function getEditableColumns(onOrderChange: (rowId: number, newOrder: number) => void): ColumnDef<DesignationDetail>[] {
    return [
        {
            accessorKey: 'HRMDES_DesignationName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />
        },
        {
            accessorKey: 'HRMDES_BasicAmount',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Basic Amount' />
        },
        {
            accessorKey: 'HRMDES_SanctionedSeats',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sanctioned Seats' />
        },
        {
            accessorKey: 'HRMDES_Order',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMDES_Order}
                    onChange={(e) => onOrderChange(row.original.HRMDES_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        }
    ];
}
