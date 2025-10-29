'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { GroupDeptDessgMappingDetail } from '@/types/hrms/group-dept-dessg-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionsCell } from './actions-cell';

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
        header: 'Actions',
        cell: ({ row }) => <ActionsCell row={row} />
    }
];
