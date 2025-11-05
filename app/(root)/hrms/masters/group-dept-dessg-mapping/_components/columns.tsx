'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useGroupDeptDessgMappingCRUD } from '@/hooks/hrms/useMasters';
import type { GroupDeptDessgMappingDetail, GroupDeptDessgMappingResponse } from '@/types/hrms/group-dept-dessg-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const groupDeptDessgMappingColumns: ColumnDef<GroupDeptDessgMappingDetail>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'HRMGT_EmployeeGroupType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const groupType = row.getValue('HRMGT_EmployeeGroupType') as string;
            return <div className='font-medium'>{groupType}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'HRMD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const department = row.getValue('HRMD_DepartmentName') as string;
            return <div className='font-medium'>{department}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRMDES_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const designation = row.getValue('HRMDES_DesignationName') as string;
            return <div className='font-medium'>{designation}</div>;
        },
        enableSorting: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start whitespace-nowrap' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: GroupDeptDessgMappingDetail }) {
    const { openEditForm } = useFormContext<GroupDeptDessgMappingResponse>();
    const { toggleMutation } = useGroupDeptDessgMappingCRUD();

    const handleEdit = useCallback(
        (data: GroupDeptDessgMappingDetail) => {
            console.log('🔵 [GROUP-DEPT-DESSG COLUMNS] handleEdit called');
            console.log('🔵 [COLUMNS] Edit button clicked for row:', JSON.stringify(data, null, 2));
            console.log('🔵 [COLUMNS] HRGTDDS_Id:', data.HRGTDDS_Id);
            console.log('🔵 [COLUMNS] HRMGT_Id:', data.HRMGT_Id);
            console.log('🔵 [COLUMNS] HRMD_Id:', data.HRMD_Id);
            console.log('🔵 [COLUMNS] HRMDES_Id:', data.HRMDES_Id);
            console.log('🔵 [COLUMNS] HRGTDDS_ActiveFlg:', data.HRGTDDS_ActiveFlg);
            console.log('🔵 [COLUMNS] Calling openEditForm...');
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: GroupDeptDessgMappingDetail, newState: boolean) => {
            console.log('🔵 [GROUP-DEPT-DESSG COLUMNS] handleToggle called');
            console.log('🔵 [COLUMNS] Toggle data:', { HRGTDDS_Id: data.HRGTDDS_Id, currentState: data.HRGTDDS_ActiveFlg, newState });
            
            try {
                const result = await toggleMutation.mutateAsync({
                    ...data,
                    HRGTDDS_ActiveFlg: newState
                });
                console.log('🟢 [COLUMNS] Toggle success:', result);
                toast.success(`Mapping ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (error: any) {
                console.log('🔴 [COLUMNS] Toggle error:', error);
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} mapping`);
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
            toggleConditionKey='HRGTDDS_ActiveFlg'
        />
    );
}
