'use client';

import { Badge } from '@/components/ui/badge';
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
        accessorKey: 'HRMGT_EmployeeGroupType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type' />,
        cell: ({ row }) => {
            const groupType = row.getValue('HRMGT_EmployeeGroupType') as string;
            return <div className='font-medium'>{groupType}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'HRMD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => {
            const department = row.getValue('HRMD_DepartmentName') as string;
            return <div className='font-medium'>{department}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRMDES_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => {
            const designation = row.getValue('HRMDES_DesignationName') as string;
            return <div className='font-medium'>{designation}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRGTDDS_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('HRGTDDS_ActiveFlg') as boolean;
            return (
                <Badge variant={isActive ? 'default' : 'secondary'} className='font-medium'>
                    {isActive ? 'Active' : 'Inactive'}
                </Badge>
            );
        },
        enableSorting: true,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: GroupDeptDessgMappingDetail }) {
    const { openEditForm } = useFormContext<GroupDeptDessgMappingResponse>();
    const { toggleMutation } = useGroupDeptDessgMappingCRUD();

    const handleEdit = useCallback(
        (data: GroupDeptDessgMappingDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: GroupDeptDessgMappingDetail, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    HRGTDDS_Id: data.HRGTDDS_Id,
                    HRGTDDS_ActiveFlg: newState
                });
                toast.success(`Mapping ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
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
