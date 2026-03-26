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
        id: 'SPCCMSCC_Id',
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
        id: 'groupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_SportsCCName',
        id: 'SPCCMSCC_SportsCCName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sports Name' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_SportsCCDesc',
        id: 'SPCCMSCC_SportsCCDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_SGFlag',
        id: 'SPCCMSCC_SGFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SG Flag' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_NoOfMembers',
        id: 'SPCCMSCC_NoOfMembers',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No.Of Members' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_RecHighLowFlag',
        id: 'SPCCMSCC_RecHighLowFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='High/Low Flag' />,
        enableSorting: true
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
