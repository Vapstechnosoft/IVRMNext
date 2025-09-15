'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import ToggleMasterClassForm from './toggle-form';
import DeleteMasterClassForm from './delete-form';
import { getStatusBadge } from '@/components/extras/helpers/helper';

export const masterClassColumns: ColumnDef<IMasterClassList>[] = [
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
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Code' />,
        cell: ({ row }) => <div>{row.getValue('code')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' />,
        cell: ({ row }) => <div>{row.getValue('name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'active_flag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Status' />,
        cell: ({ row }) => <div>{getStatusBadge((row.getValue('active_flag') as boolean) === true ? 'active' : 'inactive')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: 'Actions',
        accessorFn: (row: any) => {
            return row;
        },
        enableSorting: false,
        enableHiding: false,
        cell: ({ cell }: { cell: any }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <div className='flex-justify-between flex-wrap gap-2'>
                            <ToggleMasterClassForm cell={cell} />
                            <DeleteMasterClassForm cell={cell} />
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];
