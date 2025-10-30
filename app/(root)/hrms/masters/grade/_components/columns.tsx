'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGrade } from '@/hooks/hrms/useMasterGrade';
import type { GradeDetail, MasterGradeResponse } from '@/types/hrms/master-grade';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<GradeDetail>[] = [
    {
        accessorKey: 'HRMG_GradeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Name' />
    },
    {
        accessorKey: 'HRMG_GradeDisplayName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Display Name' />
    },
    {
        accessorKey: 'HRMG_PayScaleRange',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Pay Scale Range' />
    },
    {
        accessorKey: 'HRMG_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: GradeDetail }) {
    const { openEditForm } = useFormContext<MasterGradeResponse>();
    const { toggleMutation } = useMasterGrade(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: GradeDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: GradeDetail, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    HRMG_Id: data.HRMG_Id,
                    HRMG_ActiveFlag: newState
                });
                toast.success(`Grade ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} grade`);
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
            toggleConditionKey='HRMG_ActiveFlag'
        />
    );
}

export function getEditableColumns(onOrderChange: (rowId: number, newOrder: number) => void): ColumnDef<GradeDetail>[] {
    return [
        {
            accessorKey: 'HRMG_GradeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Name' />
        },
        {
            accessorKey: 'HRMG_GradeDisplayName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Display Name' />
        },
        {
            accessorKey: 'HRMG_PayScaleRange',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Pay Scale Range' />
        },
        {
            accessorKey: 'HRMG_Order',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMG_Order}
                    onChange={(e) => onOrderChange(row.original.HRMG_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        }
    ];
}
