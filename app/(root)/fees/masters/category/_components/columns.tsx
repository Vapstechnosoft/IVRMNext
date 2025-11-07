'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterClassYearlyList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterClassYearlyCategoryColumns: ColumnDef<IMasterClassYearlyList>[] = [
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
        accessorKey: 'fyccC_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>
    },
    {
        accessorKey: 'fmcC_ClassCategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Category' />,
        cell: ({ row }) => <div>{row.getValue('fmcC_ClassCategoryName')}</div>
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' />,
        cell: ({ row }) => {
            const classNames = row.getValue('asmcL_ClassName');
            try {
                const parsed = typeof classNames === 'string' ? JSON.parse(classNames) : classNames;
                const classArray = Array.isArray(parsed) ? parsed : [parsed];
                const displayText = classArray.join(', ');
                return <div>{displayText}</div>;
            } catch {
                return <div>{String(classNames)}</div>;
            }
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterClassYearlyList }) {
    const { openToggleForm } = useFormContext<IMasterClassYearlyList>();

    const handleToggle = useCallback((data: IMasterClassYearlyList) => openToggleForm(data), [openToggleForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: true, delete: false }}
            onToggle={handleToggle}
            toggleConditionKey='fycC_ActiveFlag'
        />
    );
}
