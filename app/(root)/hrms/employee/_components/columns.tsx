'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { EmployeeListItem } from '@/types/hrms/employee';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionsCell } from './actions-cell';

export const employeeColumns: ColumnDef<EmployeeListItem>[] = [
    {
        accessorKey: 'HRME_EmployeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => {
            const code = row.getValue('HRME_EmployeeCode') as string;
            return <div className='font-medium'>{code}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        id: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => {
            const firstName = row.original.HRME_EmployeeFirstName || '';
            const middleName = row.original.HRME_EmployeeMiddleName || '';
            const lastName = row.original.HRME_EmployeeLastName || '';
            const fullName = `${firstName} ${middleName} ${lastName}`.trim();
            return <div className='font-medium'>{fullName}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'HRMET_EmployeeType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Type' />,
        cell: ({ row }) => {
            const type = row.getValue('HRMET_EmployeeType') as string;
            return <div>{type || '-'}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRMD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => {
            const dept = row.getValue('HRMD_DepartmentName') as string;
            return <div>{dept || '-'}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRMDES_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => {
            const desig = row.getValue('HRMDES_DesignationName') as string;
            return <div>{desig || '-'}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRME_MobileNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile' />,
        cell: ({ row }) => {
            const mobile = row.getValue('HRME_MobileNo') as number;
            return <div>{mobile || '-'}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'HRME_EmailId',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
        cell: ({ row }) => {
            const email = row.getValue('HRME_EmailId') as string;
            return <div className='max-w-[200px] truncate'>{email || '-'}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'HRME_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('HRME_ActiveFlag') as boolean;
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
