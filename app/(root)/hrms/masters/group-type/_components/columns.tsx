'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
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
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />
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
            console.log('🔵 [TOGGLE] Edit button clicked for:', data.HRMGT_Id);
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: GroupTypeDetail, newState: boolean) => {
            console.log('🔵 [TOGGLE] handleToggle called');
            console.log('🔵 [TOGGLE] Record ID:', data.HRMGT_Id);
            console.log('🔵 [TOGGLE] Record Name:', data.HRMGT_EmployeeGroupType);
            console.log('🔵 [TOGGLE] Current State:', data.HRMGT_ActiveFlag);
            console.log('🔵 [TOGGLE] New State:', newState);
            
            try {
                console.log('🟡 [TOGGLE] Calling toggleMutation.mutateAsync...');
                const result = await toggleMutation.mutateAsync({
                    HRMGT_Id: data.HRMGT_Id,
                    HRMGT_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                
                console.log('🟢 [TOGGLE] Toggle result:', result);
                
                // Check if the record is mapped/in use
                const retrunMsg = (result as any)?.retrunMsg || '';
                console.log('🟢 [TOGGLE] retrunMsg:', retrunMsg);
                
                if (retrunMsg === 'Mapped') {
                    console.log('⚠️ [TOGGLE] Record is mapped - cannot deactivate');
                    toast.error('Cannot deactivate - Group Type is currently assigned/in use');
                } else {
                    console.log('✅ [TOGGLE] Success! Message: Group Type ' + (newState ? 'activated' : 'deactivated') + ' successfully');
                    toast.success(`Group Type ${newState ? 'activated' : 'deactivated'} successfully`);
                }
            } catch (error) {
                console.log('🔴 [TOGGLE] Error:', error);
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
            id: 'slNo',
            header: () => <div className='text-center font-medium'>Sl No</div>,
            cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
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
            cell: ({ row }) => (
                <Input
                    type='number'
                    value={row.original.HRMGT_Order ?? 0}
                    onChange={(e) => onOrderChange(row.original.HRMGT_Id, Number.parseInt(e.target.value) || 0)}
                    className='w-20'
                    min='0'
                />
            )
        }
    ];
}
