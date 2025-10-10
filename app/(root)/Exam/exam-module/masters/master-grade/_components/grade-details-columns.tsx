'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IGradeDetails } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';

export const GradeDetailsColumns: ColumnDef<IGradeDetails>[] = [
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
    {
        accessorKey: 'ex_Grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade' />,
        cell: ({ row }) => <div>{row.getValue('ex_Grade')}</div>,
        enableSorting: false
    },

    {
        accessorKey: 'ex_From',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From' />,
        cell: ({ row }) => <div>{row.getValue('ex_From')}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'ex_To',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To' />,
        cell: ({ row }) => <div>{String(row.getValue('ex_To'))}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'ex_GradePoints',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Points' />,
        cell: ({ row }) => <div>{row.getValue('ex_GradePoints')}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'ex_Remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => <div>{row.getValue('ex_Remarks')}</div>,
        enableSorting: false
    }
];
