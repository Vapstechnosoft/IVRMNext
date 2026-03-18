'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { SportsCCNameDTO } from '@/types/sports/masters/sports-cc-name';

interface ColumnsProps {
    onEdit: (data: SportsCCNameDTO) => void;
    onDelete: (row: SportsCCNameDTO) => void;
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<SportsCCNameDTO>[] => [
    {
        id: 'serialNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'groupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
    },
    {
        accessorKey: 'spccmscC_SportsCCName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sports Name' />,
    },
    {
        accessorKey: 'spccmscC_SportsCCDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
    },
    {
        accessorKey: 'spccmscC_SGFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SG Flag' />,
    },
    {
        accessorKey: 'spccmscC_NoOfMembers',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No.Of Members' />,
    },
    {
        accessorKey: 'spccmscC_RecHighLowFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='High/Low Flag' />,
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const data = row.original;
            return (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(data)}>
                        <Pencil className="h-4 w-4 text-primary" />
                    </Button>
                    <div className="flex items-center space-x-1">
                        <Switch
                            checked={data.spccmscC_ActiveFlag}
                            onCheckedChange={() => onDelete(data)}
                        />
                        <span className={data.spccmscC_ActiveFlag ? "text-green-600 text-xs" : "text-red-600 text-xs"}>
                            {data.spccmscC_ActiveFlag ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            );
        },
    },
];
