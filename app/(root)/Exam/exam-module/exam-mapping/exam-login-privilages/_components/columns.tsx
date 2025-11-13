'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IExamLoginPrivileges } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const ExamLoginPrivilegesColumns: ColumnDef<IExamLoginPrivileges>[] = [
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
        accessorKey: 'hrmE_EmployeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div>{row.getValue('hrmE_EmployeeName')}</div>
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>
    },
    {
        accessorKey: 'elP_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
        cell: ({ row }) => <div>{row.original.elP_ActiveFlg ? 'Yes' : 'No'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IExamLoginPrivileges }) {
    const { openEditForm, openDetailsView } = useFormContext<IExamLoginPrivileges>();

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
                toggleConditionKey='elP_ActiveFlg'
            />
        </div>
    );
}
