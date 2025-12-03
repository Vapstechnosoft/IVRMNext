'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { GroupDeptDessgMappingDetail, GroupDeptDessgMappingResponse } from '@/types/hrms/group-dept-dessg-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
export const groupDeptDessgMappingColumns: ColumnDef<GroupDeptDessgMappingDetail>[] = [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];
function ActionButtonsCell({ rowData }: { rowData: GroupDeptDessgMappingDetail }) {
    const { openEditForm, openToggleForm } = useFormContext<GroupDeptDessgMappingResponse>();

    const handleEdit = useCallback(
        (data: GroupDeptDessgMappingDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: GroupDeptDessgMappingDetail) => {
            openToggleForm(data);
        },
        [openToggleForm]
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
