'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterFeesInstallmentDueDateList } from '@/types/fees/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterInstallmentDueDateColumns: ColumnDef<IMasterFeesInstallmentDueDateList>[] = [
    // {
    //     id: 'select',
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label='Select all'
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //     size: 24
    // },
    {
        accessorKey: 'ftidD_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL NO' />,
        cell: ({ row }) => <div>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ftI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment Name' />,
        cell: ({ row }) => <div>{row.getValue('ftI_Name') ?? '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'ftidD_FromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => <div>{formatDate(row.getValue('ftidD_FromDate'))}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'ftidD_ToDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => <div>{formatDate(row.getValue('ftidD_ToDate'))}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'ftidD_ApplicableDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Applicable Date' />,
        cell: ({ row }) => <div>{formatDate(row.getValue('ftidD_ApplicableDate'))}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'ftidD_DueDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Due Date' />,
        cell: ({ row }) => <div>{formatDate(row.getValue('ftidD_DueDate'))}</div>,
        enableSorting: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function formatDate(dateString: string) {
    if (!dateString || dateString === '0001-01-01T00:00:00') return '-';
    return new Date(dateString).toLocaleDateString();
}

function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterFeesInstallmentDueDateList;
}) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterFeesInstallmentDueDateList>();

    const handleEdit = useCallback(
        (data: IMasterFeesInstallmentDueDateList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterFeesInstallmentDueDateList) => {
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
            toggleConditionKey='returnval'
        />
    );
}
