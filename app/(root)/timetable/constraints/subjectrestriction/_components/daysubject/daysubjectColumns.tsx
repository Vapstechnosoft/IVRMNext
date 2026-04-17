'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface IDaySubjectList {
    ttrdsU_Id: number;
    asmaY_Year: string;
    ttmD_DayName: string;
    ismS_SubjectName: string;
    ttrdsU_ActiveFlag: boolean;
    ttrdsU_SUbSelcFlag: boolean;
    asmaY_Id: number;
}

export const daySubjectColumns: ColumnDef<IDaySubjectList>[] = [
    {
        accessorKey: 'ttrdsU_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
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
        accessorKey: 'ttmD_DayName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day' />,
        cell: ({ row }) => <div>{row.getValue('ttmD_DayName')}</div>
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName')}</div>
    },
    {
        accessorKey: 'ttrdsU_SUbSelcFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Restriction Level' />,
        cell: ({ row }) => (
            <div className={`font-medium ${row.original.ttrdsU_SUbSelcFlag ? 'text-blue-600' : 'text-green-600'}`}>
                {row.original.ttrdsU_SUbSelcFlag ? 'Class-Section Wise' : 'General'}
            </div>
        )
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IDaySubjectList }) {
    const { openEditForm, openToggleForm, openDeleteForm } = useFormContext<IDaySubjectList>();

    const handleEdit = useCallback(
        (data: IDaySubjectList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IDaySubjectList) => {
            if (openToggleForm) openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: IDaySubjectList) => {
            if (openDeleteForm) openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            toggleConditionKey='ttrdsU_ActiveFlag'
        />
    );
}
