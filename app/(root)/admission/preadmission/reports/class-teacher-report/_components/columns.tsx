'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IClassTeacherReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const classTeacherReportColumns: ColumnDef<IClassTeacherReportList>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'IVRMSTAUL_UserName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Name' />,
        cell: ({ row }) => <div>{row.getValue('IVRMSTAUL_UserName') || 'N.A'}</div>
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' />,
        cell: ({ row }) => <div>{row.getValue('ASMCL_ClassName') || 'N.A'}</div>
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('ASMC_SectionName') || 'N.A'}</div>
    },
    {
        accessorKey: 'PAMS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div>{row.getValue('PAMS_SubjectName') || 'N.A'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false,
        enableHiding: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClassTeacherReportList }) {
    const { openEditForm, openDeleteForm } = useFormContext<IClassTeacherReportList>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);

    const handleDelete = useCallback((data: IClassTeacherReportList) => openDeleteForm(data), [openDeleteForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: true }}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );
}
