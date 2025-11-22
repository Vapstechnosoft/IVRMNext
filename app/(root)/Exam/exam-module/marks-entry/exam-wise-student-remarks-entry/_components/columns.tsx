'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IExamWiseRemarksGrid } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil } from 'lucide-react';
import { useCallback } from 'react';

export const ExamWiseStudentRemarksColumns: ColumnDef<IExamWiseRemarksGrid>[] = [
    // -----------------------------------------
    // SELECT CHECKBOX
    // -----------------------------------------
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

    // -----------------------------------------
    // Sl.No
    // -----------------------------------------
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: false
    },

    // -----------------------------------------
    // Academic Year
    // -----------------------------------------
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>
    },

    // -----------------------------------------
    // Class
    // -----------------------------------------
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>
    },

    // -----------------------------------------
    // Section
    // -----------------------------------------
    {
        accessorKey: 'asmS_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.original.asmC_SectionName}</div> // coming from API object
    },

    // -----------------------------------------
    // Exam
    // -----------------------------------------
    {
        accessorKey: 'emE_ExamName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam' />,
        cell: ({ row }) => <div>{row.getValue('emE_ExamName')}</div>
    },

    // -----------------------------------------
    // ACTIONS (Only EDIT)
    // -----------------------------------------
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

// ------------------------------------------------------
// ACTION BUTTONS CELL (ONLY EDIT BUTTON)
// ------------------------------------------------------
function ActionButtonsCell({ rowData }: { rowData: IExamWiseRemarksGrid }) {
    const { openEditForm } = useFormContext<IExamWiseRemarksGrid>();

    const handleEdit = useCallback(() => {
        openEditForm(rowData);
    }, [openEditForm, rowData]);

    return (
        <div className='flex justify-center'>
            <button type='button' onClick={handleEdit} className='rounded-md p-2 transition hover:bg-muted' title='Edit Record'>
                <Pencil className='h-4 w-4 text-blue-600' />
            </button>
        </div>
    );
}
