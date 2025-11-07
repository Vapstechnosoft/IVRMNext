'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IMasterStudentCountReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';

export const masterStudentCountReportColumns: ColumnDef<IMasterStudentCountReportList>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
    {
        accessorKey: 'asmcC_Id',
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
        accessorKey: 'User_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='User Name' />,
        cell: ({ row }) => <div>{row.getValue('User_Name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'Email_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Email-Id' />,
        cell: ({ row }) => <div>{row.getValue('Email_Id')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'Mob_No',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile Number' />,
        cell: ({ row }) => <div>{row.getValue('Mob_No')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'Created_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => <div>{row.getValue('Created_Date')}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
