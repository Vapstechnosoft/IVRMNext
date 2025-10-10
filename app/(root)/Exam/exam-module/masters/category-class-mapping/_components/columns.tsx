'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ICategoryMapping } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const CategoryClassMappingColumns: ColumnDef<ICategoryMapping>[] = [
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
        }
    },
    {
        accessorKey: 'ex_AcademicYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('ex_AcademicYear')}</div>
    },
    {
        accessorKey: 'ex_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.getValue('ex_CategoryName')}</div>
    },
    {
        accessorKey: 'ex_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('ex_ClassName')}</div>
    },
    {
        accessorKey: 'ex_SectionNames',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mapped Sections' />,
        cell: ({ row }) => {
            const sections = row.getValue('ex_SectionNames') as string[];
            return <div>{sections?.length ? sections.join(', ') : 'No sections mapped'}</div>;
        }
    },
    {
        accessorKey: 'ex_IsActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active Status' />,
        cell: ({ row }) => <div>{row.getValue('ex_IsActiveFlag') ? 'Active' : 'Inactive'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: ICategoryMapping }) {
    const { openToggleForm, openEditForm, openDetailsView } = useFormContext<ICategoryMapping>();

    const handleView = useCallback(() => {
        openDetailsView(rowData);
    }, [openDetailsView, rowData]);

    const handleEdit = useCallback(() => {
        openEditForm(rowData);
    }, [openEditForm, rowData]);

    const handleToggle = useCallback(() => {
        openToggleForm(rowData);
    }, [openToggleForm, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            {/* 👁️ Eye icon for viewing details */}
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Mapping Details'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>

            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: true, delete: false }}
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggleConditionKey='ex_IsActiveFlag'
            />
        </div>
    );
}
