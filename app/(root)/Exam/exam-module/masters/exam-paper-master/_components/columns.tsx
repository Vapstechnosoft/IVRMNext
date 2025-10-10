'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterExamPaper } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const MasterExamPaperColumns: ColumnDef<IMasterExamPaper>[] = [
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
        accessorKey: 'ex_ExamPaperType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Paper Type' />,
        cell: ({ row }) => <div>{row.getValue('ex_ExamPaperType')}</div>
    },
    {
        accessorKey: 'ex_DisplayColor',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Display Color' />,
        cell: ({ row }) => <div>{row.getValue('ex_DisplayColor')}</div>
    },
    {
        accessorKey: 'ex_PaperTypeDescription',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paper Type Description' />,
        cell: ({ row }) => <div>{row.getValue('ex_PaperTypeDescription')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterExamPaper }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterExamPaper>();

    const handleEdit = useCallback(
        (data: IMasterExamPaper) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterExamPaper) => {
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
