'use client';
import { getStatusBadge } from '@/components/extras/helpers/helper';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterSubSubject } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const subSubjectColumns: ColumnDef<IMasterSubSubject>[] = [
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
        accessorKey: 'slNo',
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
        accessorKey: 'ex_SubSubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SubSubject Name' />,
        cell: ({ row }) => <div>{row.getValue('ex_SubSubjectName')}</div>
    },
    {
        accessorKey: 'ex_SubSubjectCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SubSubject Code' />,
        cell: ({ row }) => <div>{row.getValue('ex_SubSubjectCode')}</div>
    },
    {
        accessorKey: 'ex_SubSubjectOrder',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SubSubject Order' />,
        cell: ({ row }) => <div>{row.getValue('ex_SubSubjectOrder') ?? '-'}</div>
    },
    {
        accessorKey: 'ex_IsActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active Flag' />,
        cell: ({ row }) => getStatusBadge((row.getValue('ex_IsActiveFlag') as boolean) ? 'yes' : 'no')
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterSubSubject }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterSubSubject>();

    const handleEdit = useCallback(
        (data: IMasterSubSubject) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterSubSubject) => {
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
            toggleConditionKey='ex_IsActiveFlag'
        />
    );
}
