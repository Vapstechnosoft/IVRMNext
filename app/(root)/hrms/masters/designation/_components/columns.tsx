'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterDesignation } from '@/hooks/hrms/useMasters';
import type { DesignationDetail, MasterDesignationResponse } from '@/types/hrms/master-designation';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<DesignationDetail>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'HRMDES_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMDES_BasicAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Basic Amount' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMDES_SanctionedSeats',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sanctioned Seats' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMDES_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
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
            console.log('🔵 [TOGGLE] handleToggle called');
            console.log('🔵 [TOGGLE] Record ID:', data.HRMDES_Id);
            console.log('🔵 [TOGGLE] Record Name:', data.HRMDES_DesignationName);
            console.log('🔵 [TOGGLE] Current State:', data.HRMDES_ActiveFlag);
            console.log('🔵 [TOGGLE] New State:', newState);
            
            try {
                console.log('🟡 [TOGGLE] Calling toggleMutation.mutateAsync...');
                const result = await toggleMutation.mutateAsync({
                    HRMDES_Id: data.HRMDES_Id,
                    HRMDES_ActiveFlag: newState
                });
                
                console.log('🟢 [TOGGLE] Toggle result:', result);
                
                // Check if the record is mapped/in use
                const retrunMsg = (result as any)?.retrunMsg || '';
                console.log('🟢 [TOGGLE] retrunMsg:', retrunMsg);
                
                if (retrunMsg === 'Mapped') {
                    console.log('⚠️ [TOGGLE] Record is mapped - cannot deactivate');
                    toast.error('Cannot deactivate - Designation is currently assigned/in use');
                } else {
                    console.log('✅ [TOGGLE] Success! Message: Designation ' + (newState ? 'activated' : 'deactivated') + ' successfully');
                    toast.success(`Designation ${newState ? 'activated' : 'deactivated'} successfully`);
                }
            } catch (error) {
                console.log('🔴 [TOGGLE] Error:', error);
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
            id: 'slNo',
            header: () => <div className='text-center font-medium'>Sl No</div>,
            cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
            enableSorting: false,
            size: 60
        },
        {
            accessorKey: 'HRMDES_DesignationName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMDES_BasicAmount',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Basic Amount' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMDES_SanctionedSeats',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sanctioned Seats' className='whitespace-nowrap' />
        },
        {
            accessorKey: 'HRMDES_Order',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMDES_Order ?? 0}
                    onChange={(e) => onOrderChange(row.original.HRMDES_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        }
    ];
}
