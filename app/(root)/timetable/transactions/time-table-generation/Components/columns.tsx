'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { TTGenerationGridData } from '@/types/timetable/Transaction/time-table-generation';
import { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const columns: ColumnDef<TTGenerationGridData>[] = [
    {
        id: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='S.No' />,
        cell: ({ row }) => <div className='pl-4'>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'insname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Institution Name' />,
        cell: ({ row }) => <div>{row.getValue('insname')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'categoryname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.getValue('categoryname')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmayname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmayname')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: TTGenerationGridData }) {
    const { openEditForm, openToggleForm } = useFormContext<TTGenerationGridData>();

    const handleEdit = useCallback(
        (data: TTGenerationGridData) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: TTGenerationGridData) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
           rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={() => handleEdit(rowData)}
            onToggle={() => handleToggle(rowData)}
            toggleConditionKey='ttfG_ActiveFlag'
        />
    );
}
