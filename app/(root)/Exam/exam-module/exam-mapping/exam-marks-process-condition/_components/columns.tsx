'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IExamMarksProcessCondition } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';

export const ExamMarksProcessConditionColumns: ColumnDef<IExamMarksProcessCondition>[] = [
    // Row Selection
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

    // Serial Number
    {
        accessorKey: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableHiding: true,
        enableSorting: false
    },

    // Academic Year
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>
    },

    // Exam Name
    {
        accessorKey: 'emE_ExamName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Name' />,
        cell: ({ row }) => <div>{row.getValue('emE_ExamName')}</div>
    },

    // Exam Start Date
    {
        accessorKey: 'eycE_ExamStartDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Start Date' />,
        cell: ({ row }) => {
            const value = row.getValue('eycE_ExamStartDate') as string | undefined;
            return <div>{value?.split('T')[0]}</div>;
        }
    },

    // Exam End Date
    {
        accessorKey: 'eycE_ExamEndDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam End Date' />,
        cell: ({ row }) => {
            const value = row.getValue('eycE_ExamEndDate') as string | undefined;
            return <div>{value?.split('T')[0]}</div>;
        }
    },

    // Marks Entry Last Date
    {
        accessorKey: 'eycE_MarksEntryLastDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Marks Entry Last Date' />,
        cell: ({ row }) => {
            const value = row.getValue('eycE_MarksEntryLastDate') as string | undefined;
            return <div>{value?.split('T')[0]}</div>;
        }
    },

    // Marks Process Last Date
    {
        accessorKey: 'eycE_MarksProcessLastDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Marks Process Last Date' />,
        cell: ({ row }) => {
            const value = row.getValue('eycE_MarksProcessLastDate') as string | undefined;
            return <div>{value?.split('T')[0]}</div>;
        }
    },

    // Marks Publish Date
    {
        accessorKey: 'eycE_MarksPublishDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Marks Publish Date' />,
        cell: ({ row }) => {
            const value = row.getValue('eycE_MarksPublishDate') as string | undefined;
            return <div>{value?.split('T')[0]}</div>;
        }
    }
];
