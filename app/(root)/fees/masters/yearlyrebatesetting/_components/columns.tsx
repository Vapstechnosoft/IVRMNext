'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterYearlyRebateList, IMasterYearlyRebateSettingsList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const YearlyRebateSettingColumns: ColumnDef<IMasterYearlyRebateSettingsList>[] = [
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
        cell: ({ row }) => <div>{row.getValue('asmaY_Year') ?? 'N/A'}</div>
    },
    {
        accessorKey: 'fyG_PartialRebate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rebate Type' />,
        cell: ({ row }) => <div>{row.getValue('fyG_PartialRebate') ?? 'N/A'}</div>
    },
    {
        accessorKey: 'fyG_PartialRebateAmtOrPercentageValue',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rebate Value' />,
        cell: ({ row }) => {
            const val = row.getValue('fyG_PartialRebateAmtOrPercentageValue');
            if (val === undefined || val === null || val === '') return <div />;
            const rebateType = String(row.getValue('fyG_PartialRebate') ?? '').toLowerCase();
            const formatted = rebateType.includes('percent') ? `${val}%` : String(val);
            return <div>{formatted}</div>;
        }
    },
    {
        accessorKey: 'fyg_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const dateVal = row.getValue('fyg_date');
            return <div>{dateVal ? String(dateVal) : 'N/A'}</div>;
        }
    },
    {
        accessorKey: 'asmcl_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
        cell: ({ row }) => {
            const val = row.getValue('asmcl_ActiveFlag');
            return <div>{val ? 'Active' : 'Inactive'}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterYearlyRebateList;
}) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterYearlyRebateList>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
    const handleToggle = useCallback(() => openToggleForm?.(rowData), [openToggleForm, rowData]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='asmcl_ActiveFlag'
        />
    );
}
