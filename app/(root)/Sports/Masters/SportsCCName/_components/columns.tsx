'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { SportsCCNameDTO } from '@/types/sports/masters/sports-cc-name';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { Badge } from '@/components/ui/badge';

interface ColumnsProps {
    onEdit: (data: SportsCCNameDTO) => void;
    onDelete: (row: SportsCCNameDTO) => void;
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<SportsCCNameDTO>[] => [
    {
        accessorKey: 'spccmscC_Id',
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
        accessorKey: 'groupName',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Group Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'spccmscC_SportsCCName',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Sports Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'spccmscC_SportsCCDesc',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Description
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'spccmscC_SGFlag',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    SG Flag
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'spccmscC_NoOfMembers',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    No.Of Members
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'spccmscC_RecHighLowFlag',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    High/Low Flag
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <ActionButtons
                rowData={row.original}
                buttons={{
                    edit: true,
                    toggle: true,
                    delete: false
                }}
                onEdit={() => onEdit(row.original)}
                onToggle={() => onDelete(row.original)}
                toggleConditionKey='spccmscC_ActiveFlag'
            />
        )
    },
];
