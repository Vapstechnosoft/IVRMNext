'use client';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IHomeWork } from '@/schemas/upload/transactions/ivrm-homework.schema';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';

const columnHelper = createColumnHelper<IHomeWork>();

export const homeWorkColumns = [
    columnHelper.display({
        id: 'slNo',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Sl No' />
        ),
        cell: ({ row }) => row.index + 1
    }),
    columnHelper.accessor('ismS_SubjectName', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Subject' />
        ),
        cell: ({ row }) => row.original.ismS_SubjectName
    }),
    columnHelper.accessor('asmcL_ClassName', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Class' />
        ),
        cell: ({ row }) => row.original.asmcL_ClassName
    }),
    columnHelper.accessor('asmC_SectionName', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Section' />
        ),
        cell: ({ row }) => row.original.asmC_SectionName
    }),
    columnHelper.accessor('ihW_Topic', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Topic' />
        ),
        cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.original.ihW_Topic}>{row.original.ihW_Topic}</div>
    }),
    columnHelper.accessor('createdDate', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Update Date / Time' />
        ),
        cell: ({ row }) => (
            <div className="flex flex-col text-xs">
                <span>{row.original.createdDate}</span>
                <span className="text-muted-foreground">{row.original.createdTime}</span>
            </div>
        )
    }),
    columnHelper.accessor('ihW_Assignment', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Assignment' />
        ),
        cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.original.ihW_Assignment || ''}>{row.original.ihW_Assignment}</div>
    }),
    columnHelper.accessor('ihW_Date', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Homework Date' />
        ),
        cell: ({ row }) => row.original.ihW_Date ? format(new Date(row.original.ihW_Date), 'dd-MM-yyyy') : ''
    }),
    columnHelper.display({
        id: 'attachment',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Attachment' />
        ),
        cell: ({ row }) => {
            const count = row.original.filesCount || 0;
            if (count === 0) return '---';
            return (
                <Button variant="ghost" size="sm" className="text-primary h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                </Button>
            );
        }
    }),
    columnHelper.display({
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Action' />
        ),
        cell: ({ row }) => {
            const { openEditForm, openToggleForm } = useFormContext<IHomeWork>();
            return (
                <ActionButtons
                    rowData={row.original}
                    buttons={{ edit: true, toggle: true, delete: false }}
                    onEdit={() => openEditForm(row.original)}
                    onToggle={() => openToggleForm(row.original)}
                    toggleConditionKey="ihW_ActiveFlag"
                />
            );
        }
    })
];
