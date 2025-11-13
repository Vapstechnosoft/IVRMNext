'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { useCallback } from 'react';

export interface LeaveAuthorization extends BaseEntity {
    institution: string;
    gradeName: string;
    groupTypeName: string;
    departmentName: string;
    designationName: string;
    leaveType: string;
    orderOfApproval: string;
    approvalPerson: string;
    finalFlag: boolean;
    emailId: string;
    sanctionedUser: string;
    sanctionedOrder: string;
}

export const leaveAuthorizationColumns: ColumnDef<LeaveAuthorization>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'gradeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Name' />,
        cell: ({ row }) => <div>{row.getValue('gradeName')}</div>
    },
    {
        accessorKey: 'departmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department Name' />,
        cell: ({ row }) => <div>{row.getValue('departmentName')}</div>
    },
    {
        accessorKey: 'designationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation Name' />,
        cell: ({ row }) => <div>{row.getValue('designationName')}</div>
    },
    {
        accessorKey: 'groupTypeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type Name' />,
        cell: ({ row }) => <div>{row.getValue('groupTypeName')}</div>
    },
    {
        accessorKey: 'leaveType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Type' />,
        cell: ({ row }) => <div>{row.getValue('leaveType')}</div>
    },
    {
        accessorKey: 'emailId',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Email Id' />,
        cell: ({ row }) => <div className='text-sm'>{row.getValue('emailId')}</div>
    },
    {
        accessorKey: 'sanctionedUser',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sanctioned User' />,
        cell: ({ row }) => <div>{row.getValue('sanctionedUser')}</div>
    },
    {
        accessorKey: 'sanctionedOrder',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sanctioned Order' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('sanctionedOrder')}</div>
    },
    {
        accessorKey: 'finalFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Final Flag' />,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                {row.original.finalFlag ? <span className='text-green-600'>✓</span> : <X className='h-4 w-4 text-red-600' />}
            </div>
        )
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: LeaveAuthorization }) {
    const { openEditForm } = useFormContext<LeaveAuthorization>();

    const handleEdit = useCallback(
        (data: LeaveAuthorization) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return <ActionButtons rowData={rowData} buttons={{ edit: true, toggle: false, delete: false }} onEdit={handleEdit} />;
}
