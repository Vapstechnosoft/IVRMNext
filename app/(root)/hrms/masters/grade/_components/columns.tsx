'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGrade } from '@/hooks/hrms/useMasters';
import type { GradeDetail, MasterGradeResponse } from '@/types/hrms/master-grade';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<GradeDetail>[] = [
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
        accessorKey: 'HRMG_GradeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Name' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMG_GradeDisplayName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Display Name' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMG_PayScaleFrom',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Pay Scale From' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMG_IncrementOf',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Increment Of' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMG_PayScaleTo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Pay Scale To' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMG_PayScaleRange',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Pay Scale Range' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMG_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const orderValue = row.original.HRMG_Order;
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
                const result = await toggleMutation.mutateAsync({
                    HRMG_Id: data.HRMG_Id,
                    HRMG_ActiveFlag: newState
                });

                // Check if grade is mapped/in use
                if (result && typeof result === 'object' && 'retrunMsg' in result) {
                    const retrunMsg = (result as any).retrunMsg;

                    if (retrunMsg === 'Mapped') {
                        toast.error('Cannot deactivate - Grade is currently assigned/in use');
                        return;
                    }
                }

                toast.success(`Grade ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error: any) {
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
            accessorKey: 'HRMG_GradeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Name' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMG_GradeDisplayName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Display Name' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMG_PayScaleFrom',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Pay Scale From' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMG_IncrementOf',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Increment Of' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMG_PayScaleTo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Pay Scale To' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMG_PayScaleRange',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Pay Scale Range' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMG_Order',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
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
