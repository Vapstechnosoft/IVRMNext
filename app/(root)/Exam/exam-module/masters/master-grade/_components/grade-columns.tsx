'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const MasterGradeColumns: ColumnDef<IMasterGrade>[] = [
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
        accessorKey: 'ex_GradeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Name' />,
        cell: ({ row }) => <div>{row.getValue('ex_GradeName')}</div>
    },
    {
        accessorKey: 'ex_GradeDetails',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Details' />,
        cell: ({ row }) => <div>{row.getValue('ex_GradeDetails')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterGrade }) {
    const { openToggleForm, openEditForm, openDetailsView } = useFormContext<IMasterGrade>();

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
            {/* 👁️ Eye icon for viewing grade details */}
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Grade Details'>
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
