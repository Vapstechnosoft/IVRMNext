'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export interface IYearlyCategoryDatesMapping {
    ycdm_Id: number; // Primary ID
    asmaY_Year: string; // Academic Year
    emcA_CategoryName: string; // Category Name
    startDate: string; // Start Date
    endDate: string; // End Date
    ycdm_ActiveFlg: boolean; // Active / Inactive
}

export const YearlyCategoryDatesMappingColumns: ColumnDef<IYearlyCategoryDatesMapping>[] = [
    // Row Selection
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

    // Serial Number
    {
        accessorKey: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        }
    },

    // Academic Year
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>
    },

    // Category
    {
        accessorKey: 'emcA_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.getValue('emcA_CategoryName')}</div>
    },

    // Start Date
    {
        accessorKey: 'startDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Start Date' />,
        cell: ({ row }) => <div>{row.getValue('startDate')}</div>
    },

    // End Date
    {
        accessorKey: 'endDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='End Date' />,
        cell: ({ row }) => <div>{row.getValue('endDate')}</div>
    },

    // Active / Inactive
    {
        accessorKey: 'ycdm_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => <div className='text-center'>{row.original.ycdm_ActiveFlg ? 'Active' : 'Inactive'}</div>
    },

    // Actions
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

// Actions Cell
function ActionButtonsCell({ rowData }: { rowData: IYearlyCategoryDatesMapping }) {
    const { openEditForm, openDetailsView } = useFormContext<IYearlyCategoryDatesMapping>();

    const handleView = useCallback(() => openDetailsView(rowData), [openDetailsView, rowData]);
    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Dates Mapping'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, delete: false, toggle: true }}
                onEdit={handleEdit}
                onDelete={() => {}}
                toggleConditionKey='ycdm_ActiveFlg'
            />
        </div>
    );
}
