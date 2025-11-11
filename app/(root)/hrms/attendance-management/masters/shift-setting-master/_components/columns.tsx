'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface ShiftSetting {
    id: number;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    lunchStartTime: string;
    lunchEndTime: string;
    totalWorkingHours: string;
    halfDayWorkingHours: string;
    lunchHours: string;
    delayPerShift: string;
    earlyPerShift: string;
    isActive: boolean;
    createdAt: Date;
}

export const shiftSettingColumns: ColumnDef<ShiftSetting>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'shiftName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Name' />,
        cell: ({ row }) => <div>{row.getValue('shiftName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'shiftStartTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Start Time' />,
        cell: ({ row }) => <div>{row.getValue('shiftStartTime')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'shiftEndTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Shift End Time' />,
        cell: ({ row }) => <div>{row.getValue('shiftEndTime')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const isActive = row.getValue('isActive') as boolean;
            return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: ShiftSetting }) {
    const { openEditForm } = useFormContext<ShiftSetting>();

    const handleEdit = useCallback(
        (data: ShiftSetting) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: false }}
            onEdit={handleEdit}
        />
    );
}
