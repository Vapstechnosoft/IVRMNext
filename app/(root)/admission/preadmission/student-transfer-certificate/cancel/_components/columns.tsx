'use client';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface ITCCancelSearch {
    id: number;
    tcAppNo: string;
    studentName: string;
    class: string;
    tcDate: string;
}

export const tcCancelColumns = (onSelect: (data: ITCCancelSearch) => void): ColumnDef<ITCCancelSearch>[] => [
    {
        accessorKey: 'tcAppNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='TC App No' />,
        cell: ({ row }) => <div>{row.getValue('tcAppNo')}</div>
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div>{row.getValue('studentName')}</div>
    },
    {
        accessorKey: 'class',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('class')}</div>
    },
    {
        accessorKey: 'tcDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='TC Date' />,
        cell: ({ row }) => <div>{row.getValue('tcDate')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' />,
        cell: ({ row }) => (
            <Button size='sm' variant='destructive' onClick={() => onSelect(row.original)}>
                Cancel TC
            </Button>
        )
    }
];
