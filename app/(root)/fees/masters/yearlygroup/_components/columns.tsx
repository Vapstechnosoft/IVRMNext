'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { YearlyGroupSchema } from '@/schemas/fees/masters';
import type { IMaasterFeesYearlyGrouping } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const YearlyColoumnsColumns: ColumnDef<IMaasterFeesYearlyGrouping>[] = [
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
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmG_GroupNames',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Groups' />,
        cell: ({ row }) => <div>{(row.getValue('fmG_GroupNames') as string[]).join(', ')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'fmI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment Name' />,
        cell: ({ row }) => <div>{row.getValue('fmI_Name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmI_No_Of_Installments',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No. of Installments' />,
        cell: ({ row }) => <div>{row.getValue('fmI_No_Of_Installments')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmI_Installment_Type',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment Type' />,
        cell: ({ row }) => <div>{row.getValue('fmI_Installment_Type')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'rebateApplicable',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rebate Applicable' />,
        cell: ({ row }) => <div>{row.getValue('rebateApplicable') ? 'Yes' : 'No'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'rebateType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rebate Type' />,
        cell: ({ row }) => <div>{row.getValue('rebateType') || 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'rebateValue',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rebate Value' />,
        cell: ({ row }) => <div>{row.getValue('rebateValue') || 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: IMaasterFeesYearlyGrouping;
}) {
    const { openEditForm, openToggleForm, openDeleteForm } = useFormContext<IMaasterFeesYearlyGrouping>();

    const handleEdit = useCallback(
        (data: IMaasterFeesYearlyGrouping) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMaasterFeesYearlyGrouping) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: IMaasterFeesYearlyGrouping) => {
            const deleteData = { fyG_Id: data.fmG_Id };
            const validationResult = YearlyGroupSchema.delete.safeParse(deleteData);
            if (!validationResult.success) {
                toast.error(validationResult.error.errors[0].message);
                return;
            }

            if (openDeleteForm) {
                openDeleteForm(data);
            } else {
                toast.success(`Successfully deleted record with ID ${data.fmG_Id}`);
            }
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            toggleConditionKey='fmH_ActiveFlag'
        />
    );
}
