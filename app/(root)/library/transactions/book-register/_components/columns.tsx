'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const BookRegisterColumns: ColumnDef<BookRegisterPayload>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='w-full pl-4' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-4'>{continuousIndex}</div>;
        },
        size: 70,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'lmB_BookTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />,
        cell: ({ row }) => <div className='min-w-[150px]'>{row.getValue('lmB_BookTitle')}</div>
    },
    {
        accessorKey: 'lmbanO_AccessionNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No' />,
        cell: ({ row }) => <div>{row.getValue('lmbanO_AccessionNo')}</div>,
        size: 100
    },
    {
        accessorKey: 'lmP_PublisherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Publisher Name' />,
        cell: ({ row }) => <div>{row.getValue('lmP_PublisherName') || '-'}</div>
    },
    {
        accessorKey: 'lmD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Dept Name' />,
        cell: ({ row }) => <div>{(row.original as any).lmD_DepartmentName || '-'}</div>
    },
    {
        accessorKey: 'lmS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Name' />,
        cell: ({ row }) => <div>{(row.original as any).lmS_SubjectName || '-'}</div>
    },
    {
        accessorKey: 'lmL_LanguageName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Language' />,
        cell: ({ row }) => <div>{row.getValue('lmL_LanguageName') || '-'}</div>
    },

    {
        accessorKey: 'lmrA_RackName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rack name' />,
        cell: ({ row }) => <div>{row.getValue('lmrA_RackName') || '-'}</div>
    },
    {
        accessorKey: 'lmbanO_AvialableStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = row.getValue('lmbanO_AvialableStatus') as string;
            return (
                <Badge
                    variant={
                        status === 'Available'
                            ? 'default'
                            : status === 'lost'
                              ? 'destructive'
                              : status === 'Issued'
                                ? 'secondary'
                                : 'outline'
                    }>
                    {status}
                </Badge>
            );
        }
    },
    {
        accessorKey: 'authoR_FullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Author Name' />,
        cell: ({ row }) => <div>{row.getValue('authoR_FullName') || '-'}</div>
    },
    {
        accessorKey: 'mB_Remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remark' />,
        cell: ({ row }) => <div>{row.getValue('mB_Remarks') || '-'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 150
    }
];

function ActionButtonsCell({ rowData }: { rowData: BookRegisterPayload }) {
    const { openToggleForm, openEditForm, openCopyForm } = useFormContext<BookRegisterPayload>();

    const handleToggle = useCallback(
        (data: BookRegisterPayload) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleEdit = useCallback((data: BookRegisterPayload) => openEditForm(data), [openEditForm]);

    const handleCopy = useCallback(
        (data: BookRegisterPayload) => {
            openCopyForm(data);
        },
        [openCopyForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false, copy: true }}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onCopy={handleCopy}
            toggleConditionKey='mB_ActiveFlag'
            className='justify-start'
        />
    );
}
