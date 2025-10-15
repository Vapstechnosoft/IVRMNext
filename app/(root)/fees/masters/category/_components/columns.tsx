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
            const classNames = row.getValue('asmcL_ClassName') as string;
            try {
                const parsed = JSON.parse(classNames);
                const displayText = Array.isArray(parsed) ? parsed.join(', ') : classNames;
                return <div>{displayText}</div>;
            } catch {
                return <div>{classNames}</div>;
            }
        }
    },
    {
        accessorKey: 'fycC_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active' className='pl-6 text-left' />,
        cell: ({ row }) => {
            const isActive = row.getValue('fycC_ActiveFlag');
            return (
                <div className='flex items-center justify-start pl-6'>
                    <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-500'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true,
        size: 100
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterClassYearlyList }) {
    const { openToggleForm, openEditForm } = useFormContext<IMasterClassYearlyList>();

    const handleToggle = useCallback((data: IMasterClassYearlyList) => openToggleForm(data), [openToggleForm]);

    const handleEdit = useCallback((data: IMasterClassYearlyList) => openEditForm(data), [openEditForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='fycC_ActiveFlag'
        />
    );
}
