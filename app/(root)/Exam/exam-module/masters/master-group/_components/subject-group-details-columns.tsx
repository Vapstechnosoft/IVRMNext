'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IMasterSubjectGroupDetails } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';

export const MasterSubjectGroupDetailsColumns: ColumnDef<IMasterSubjectGroupDetails>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
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
        accessorKey: 'ex_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Name' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'ismS_SubjectCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Code' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectCode')}</div>,
        enableSorting: false,
        enableHiding: true
    }
];
