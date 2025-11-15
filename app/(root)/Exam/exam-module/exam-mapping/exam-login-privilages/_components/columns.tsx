'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IExamLoginPrivilegesView } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const ExamLoginPrivilegesColumns: ColumnDef<IExamLoginPrivilegesView>[] = [
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
        accessorKey: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        }
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>
    },
    {
        accessorKey: 'userName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='User Name' />,
        cell: ({ row }) => <div>{row.getValue('userName')}</div>
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div>{row.getValue('employeeName')}</div>
    },
    {
        accessorKey: 'className',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('className')}</div>
    },
    {
        accessorKey: 'sectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('sectionName')}</div>
    },
    {
        accessorKey: 'subjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div>{row.getValue('subjectName')}</div>
    },
    {
        accessorKey: 'subSubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sub Subject' />,
        cell: ({ row }) => <div>{row.original.subSubjectName || '-'}</div>
    },
    {
        accessorKey: 'activeStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
        cell: ({ row }) => <div>{row.original.activeStatus ? 'Yes' : 'No'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IExamLoginPrivilegesView }) {
    const { openEditForm, openDetailsView } = useFormContext<IExamLoginPrivilegesView>();

    const handleView = useCallback(() => openDetailsView(rowData), [openDetailsView, rowData]);
    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Details'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, delete: true, toggle: true }}
                onEdit={handleEdit}
                onDelete={() => {}}
                toggleConditionKey='activeStatus'
            />
        </div>
    );
}
